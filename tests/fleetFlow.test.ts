import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app';
import { resetTestState } from './reset';

const createVehicle = async (tenantId = 'tenant-a') => {
  const response = await request(app).post('/vehicles').send({
    tenantId,
    plate: `ABC-${tenantId}`,
    type: 'van',
    odometerKm: 42000
  });
  return response.body;
};

describe('fleet maintenance API', () => {
  beforeEach(() => resetTestState());

  it('creates and lists tenant-scoped vehicles', async () => {
    await createVehicle('tenant-a');
    await createVehicle('tenant-b');

    const response = await request(app).get('/vehicles').query({ tenantId: 'tenant-a' }).expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].tenantId).toBe('tenant-a');
  });

  it('rejects duplicate plates inside the same tenant', async () => {
    await createVehicle('tenant-a');

    const response = await request(app).post('/vehicles').send({
      tenantId: 'tenant-a',
      plate: 'ABC-tenant-a',
      type: 'truck',
      odometerKm: 10
    }).expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('does not allow odometer rollback', async () => {
    const vehicle = await createVehicle();

    const response = await request(app)
      .patch(`/vehicles/${vehicle.id}/odometer`)
      .send({ odometerKm: 1000 })
      .expect(400);

    expect(response.body.message).toContain('backwards');
  });

  it('creates work orders and marks vehicles as in maintenance', async () => {
    const vehicle = await createVehicle();

    const workOrder = await request(app).post('/work-orders').send({
      tenantId: 'tenant-a',
      vehicleId: vehicle.id,
      category: 'corrective',
      notes: 'Brake noise'
    }).expect(201);

    expect(workOrder.body.status).toBe('open');

    const vehicles = await request(app).get('/vehicles').query({ tenantId: 'tenant-a', status: 'in_maintenance' }).expect(200);
    expect(vehicles.body).toHaveLength(1);
  });

  it('prevents two open work orders for the same vehicle', async () => {
    const vehicle = await createVehicle();
    await request(app).post('/work-orders').send({ tenantId: 'tenant-a', vehicleId: vehicle.id, category: 'corrective' }).expect(201);

    const response = await request(app).post('/work-orders').send({ tenantId: 'tenant-a', vehicleId: vehicle.id, category: 'tires' }).expect(409);

    expect(response.body.message).toContain('open work order');
  });

  it('releases the vehicle when a work order is cancelled', async () => {
    const vehicle = await createVehicle();
    const workOrder = await request(app).post('/work-orders').send({ tenantId: 'tenant-a', vehicleId: vehicle.id, category: 'inspection' }).expect(201);

    await request(app).patch(`/work-orders/${workOrder.body.id}/status`).send({ status: 'cancelled' }).expect(200);

    const vehicles = await request(app).get('/vehicles').query({ tenantId: 'tenant-a', status: 'active' }).expect(200);
    expect(vehicles.body).toHaveLength(1);
  });

  it('blocks expenses on cancelled work orders', async () => {
    const vehicle = await createVehicle();
    const workOrder = await request(app).post('/work-orders').send({ tenantId: 'tenant-a', vehicleId: vehicle.id, category: 'inspection' }).expect(201);
    await request(app).patch(`/work-orders/${workOrder.body.id}/status`).send({ status: 'cancelled' }).expect(200);

    const response = await request(app).post(`/work-orders/${workOrder.body.id}/expenses`).send({ amountCents: 15000, description: 'Inspection fee' }).expect(400);

    expect(response.body.message).toContain('cancelled');
  });

  it('reports maintenance due by mileage and date', async () => {
    const vehicle = await createVehicle();
    await request(app).post('/maintenance-plans').send({
      tenantId: 'tenant-a',
      vehicleId: vehicle.id,
      name: 'Oil change',
      intervalKm: 10000,
      intervalDays: 180,
      lastServiceKm: 30000,
      lastServiceDate: '2025-01-01'
    }).expect(201);

    const response = await request(app).get('/maintenance/due').query({ tenantId: 'tenant-a', asOfDate: '2025-08-01' }).expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].reason).toBe('both');
  });

  it('keeps maintenance due checks tenant scoped', async () => {
    const vehicleA = await createVehicle('tenant-a');
    const vehicleB = await createVehicle('tenant-b');
    await request(app).post('/maintenance-plans').send({ tenantId: 'tenant-a', vehicleId: vehicleA.id, name: 'Oil', intervalKm: 10000, intervalDays: 180, lastServiceKm: 30000, lastServiceDate: '2025-01-01' });
    await request(app).post('/maintenance-plans').send({ tenantId: 'tenant-b', vehicleId: vehicleB.id, name: 'Oil', intervalKm: 10000, intervalDays: 180, lastServiceKm: 30000, lastServiceDate: '2025-01-01' });

    const response = await request(app).get('/maintenance/due').query({ tenantId: 'tenant-a', asOfDate: '2025-08-01' }).expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].vehicleId).toBe(vehicleA.id);
  });

  it('adds completed work order expenses to fleet cost reports', async () => {
    const vehicle = await createVehicle();
    const workOrder = await request(app).post('/work-orders').send({ tenantId: 'tenant-a', vehicleId: vehicle.id, category: 'corrective' }).expect(201);
    await request(app).patch(`/work-orders/${workOrder.body.id}/status`).send({ status: 'in_progress' }).expect(200);
    await request(app).post(`/work-orders/${workOrder.body.id}/expenses`).send({ amountCents: 25000, description: 'Parts' }).expect(201);
    await request(app).patch(`/work-orders/${workOrder.body.id}/status`).send({ status: 'completed' }).expect(200);

    const report = await request(app).get('/reports/fleet-costs').query({ tenantId: 'tenant-a' }).expect(200);

    expect(report.body.totalCents).toBe(25000);
    expect(report.body.vehicles[0].expenseCount).toBe(1);
  });
});
