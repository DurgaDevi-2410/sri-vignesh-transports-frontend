import { localStorageDB } from './localStorageDB';

// --- Local Bookings ---
export const getLocalBookings = async () => {
  return localStorageDB.getAll('local_bookings');
};
export const saveLocalBooking = async (data) => {
  localStorageDB.save('local_bookings', data);
};
export const deleteLocalBooking = async (id) => {
  localStorageDB.delete('local_bookings', id);
};

// --- Company Bookings ---
export const getCompanyBookings = async () => {
  return localStorageDB.getAll('company_bookings');
};
export const saveCompanyBooking = async (data) => {
  localStorageDB.save('company_bookings', data);
};
export const deleteCompanyBooking = async (id) => {
  localStorageDB.delete('company_bookings', id);
};

// --- Companies ---
export const getCompanies = async () => {
  return localStorageDB.getAll('companies');
};
export const saveCompany = async (data) => {
  localStorageDB.save('companies', data);
};
export const deleteCompany = async (id) => {
  localStorageDB.delete('companies', id);
};

// --- Vehicles ---
export const getVehicles = async () => {
  return localStorageDB.getAll('vehicles');
};
export const saveVehicle = async (data) => {
  localStorageDB.save('vehicles', data);
};
export const deleteVehicle = async (id) => {
  localStorageDB.delete('vehicles', id);
};

// --- Expenses ---
export const getExpenses = async () => {
  return localStorageDB.getAll('expenses');
};
export const saveExpense = async (data) => {
  localStorageDB.save('expenses', data);
};
export const deleteExpense = async (id) => {
  localStorageDB.delete('expenses', id);
};

