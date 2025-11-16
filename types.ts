export interface User {
  id: string;
  name: string;
  role: 'driver' | 'admin';
  password?: string; // Added for login
  vehicle?: string; // Added for record keeping
}

export type NewUserData = Pick<User, 'name' | 'password' | 'vehicle'>;

export enum FuelType {
  Gasoline = 'Gasolina',
  Diesel = 'Diesel',
  Ethanol = 'Etanol',
}

export interface PhotoData {
  base64: string;
  timestamp: string; // ISO string from file metadata
}

export interface FuelingRecord {
  id: string;
  driverId: string;
  driverName: string;
  vehicle: string;
  vehiclePlate: string;

  // Fueling details
  cost: number;
  liters: number;
  fuelType: FuelType;

  // Vehicle state at fueling
  mileage: number;

  // Evidence
  dashboardPhoto: PhotoData;
  pumpPhoto: PhotoData;

  // System timestamp
  recordTimestamp: string;
}