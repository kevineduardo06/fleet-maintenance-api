import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auditRepository } from './modules/audit/auditRepository';
import { maintenanceService } from './modules/maintenance/maintenanceService';
import { reportService } from './modules/reports/reportService';
import { vehicleService } from './modules/vehicles/vehicleService';
import { workOrderService } from './modules/workOrders/workOrderService';
import { HttpError } from './shared/errors';

const app = express();
app.use(cors());
app.use(express.json());

const vehicleSchema = z.object({
  tenantId: z.string().min(1),
  plate: z.string().min(3),
  type: z.enum(['van', 'truck', 'car', 'motorcycle']),
  odometerKm: z.number().int().nonnegative()
});

const workOrderSchema = z.object({
  tenantId: z.string().min(1),
  vehicleId: z.string().min(1),
  category: z.enum(['preventive', 'corrective', 'inspection', 'tires']),
  notes: z.string().optional()
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/vehicles', (req, res) => {
  res.status(201).json(vehicleService.create(vehicleSchema.parse(req.body)));
});

app.get('/vehicles', (req, res) => {
  const tenantId = String(req.query.tenantId ?? '');
  if (!tenantId) throw new HttpError(400, 'tenantId is required');
  res.json(vehicleService.list({
    tenantId,
    status: req.query.status as any,
    type: req.query.type as any
  }));
});

app.patch('/vehicles/:id/odometer', (req, res) => {
  const body = z.object({ odometerKm: z.number().int().nonnegative() }).parse(req.body);
  res.json(vehicleService.updateOdometer(req.params.id, body.odometerKm));
});

app.post('/maintenance-plans', (req, res) => {
  const body = z.object({
    tenantId: z.string().min(1),
    vehicleId: z.string().min(1),
    name: z.string().min(1),
    intervalKm: z.number().int().positive(),
    intervalDays: z.number().int().positive(),
    lastServiceKm: z.number().int().nonnegative(),
    lastServiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }).parse(req.body);
  res.status(201).json(maintenanceService.createPlan(body));
});

app.get('/maintenance/due', (req, res) => {
  const tenantId = String(req.query.tenantId ?? '');
  const asOfDate = String(req.query.asOfDate ?? new Date().toISOString().slice(0, 10));
  if (!tenantId) throw new HttpError(400, 'tenantId is required');
  res.json(maintenanceService.listDue(tenantId, asOfDate));
});

app.patch('/maintenance-plans/:id/serviced', (req, res) => {
  const body = z.object({
    odometerKm: z.number().int().nonnegative(),
    serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  }).parse(req.body);
  res.json(maintenanceService.markServiced(req.params.id, body));
});

app.post('/work-orders', (req, res) => {
  res.status(201).json(workOrderService.create(workOrderSchema.parse(req.body)));
});

app.get('/work-orders', (req, res) => {
  const tenantId = String(req.query.tenantId ?? '');
  if (!tenantId) throw new HttpError(400, 'tenantId is required');
  res.json(workOrderService.list({ tenantId, vehicleId: req.query.vehicleId as string | undefined, status: req.query.status as any }));
});

app.patch('/work-orders/:id/status', (req, res) => {
  const body = z.object({ status: z.enum(['open', 'in_progress', 'completed', 'cancelled']) }).parse(req.body);
  res.json(workOrderService.updateStatus(req.params.id, body.status));
});

app.post('/work-orders/:id/expenses', (req, res) => {
  const body = z.object({ amountCents: z.number().int().positive(), description: z.string().min(1) }).parse(req.body);
  res.status(201).json(workOrderService.addExpense(req.params.id, body));
});

app.get('/reports/fleet-costs', (req, res) => {
  const tenantId = String(req.query.tenantId ?? '');
  if (!tenantId) throw new HttpError(400, 'tenantId is required');
  res.json(reportService.fleetCosts(tenantId));
});

app.get('/audit-logs', (req, res) => {
  const tenantId = String(req.query.tenantId ?? '');
  if (!tenantId) throw new HttpError(400, 'tenantId is required');
  res.json(auditRepository.list(tenantId));
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({ message: 'Validation failed', issues: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
