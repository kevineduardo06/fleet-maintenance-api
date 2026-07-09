let sequence = 1;
export const nextId = (prefix: string): string => `${prefix}_${sequence++}`;
export const resetIds = () => { sequence = 1; };
