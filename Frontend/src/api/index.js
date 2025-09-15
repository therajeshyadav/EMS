import client from './client';

// Factory helpers that return resource-specific APIs in a concise, chainable style

export const AuthApi = () => ({
  login: (body) => client.post('/auth/login', body),
  signup: (body) => client.post('/auth/signup', body),
  logout: () => client.post('/auth/logout'),
  verify: () => client.get('/auth/verify-token'),
});

export const EmployeesApi = () => ({
  list: (params) => client.get('/employees', params),
  me: () => client.get('/employees/me'),
  get: (id) => client.get(`/employees/${id}`),
  create: (body) => client.post('/employees', body),
  update: (id, body) => client.put(`/employees/${id}`, body),
  remove: (id) => client.delete(`/employees/${id}`),
  stats: (id) => client.get(`/employees/stats/${id}`),
});

export const AttendanceApi = () => ({
  list: (params) => client.get('/attendance', params),
  me: (params) => client.get('/attendance/me', params),
  checkIn: (body) => client.post('/attendance/check-in', body),
  checkOut: (body) => client.post('/attendance/check-out', body),
  update: (id, body) => client.put(`/attendance/${id}`, body),
  reports: (params) => client.get('/attendance/reports', params),
});

export const LeavesApi = () => ({
  list: (params) => client.get('/leaves', params),
  create: (body) => client.post('/leaves', body),
  approve: (id) => client.put(`/leaves/${id}/approve`, {}),
  reject: (id, body) => client.put(`/leaves/${id}/reject`, body),
  balance: (employeeId) => client.get(`/leaves/balance/${employeeId}`),
  me: (params) => client.get('/leaves/me', params),
});

export const TasksApi = () => ({
  list: (params) => client.get('/tasks', params),
  mine: (employeeId, params) => client.get(`/tasks/me/${employeeId}`, params),
  create: (body) => client.post('/tasks', body),
  update: (id, body) => client.put(`/tasks/${id}`, body),
  setStatus: (id, status) => client.patch(`/tasks/${id}/status`, { status }),
});

export const PayrollApi = () => ({
  list: (params) => client.get('/payroll', params),
  generate: (body) => client.post('/payroll/generate', body),
  process: (body) => client.post('/payroll/process', body),
});

export const NotificationsApi = () => ({
  list: (params) => client.get('/notifications', params),
  create: (body) => client.post('/notifications', body),
  markRead: (id) => client.put(`/notifications/${id}/read`, {}),
});

export const DepartmentsApi = () => ({
  list: (params) => client.get('/departments', params),
  get: (id) => client.get(`/departments/${id}`),
  create: (body) => client.post('/departments', body),
  update: (id, body) => client.put(`/departments/${id}`, body),
  remove: (id) => client.delete(`/departments/${id}`),
  employees: (id, params) => client.get(`/departments/${id}/employees`, params),
  stats: (id) => client.get(`/departments/${id}/stats`),
  setHead: (id, headId) => client.put(`/departments/${id}/head`, { headId }),
});

export const PositionsApi = () => ({
  list: (params) => client.get('/positions', params),
  get: (id) => client.get(`/positions/${id}`),
  create: (body) => client.post('/positions', body),
  update: (id, body) => client.put(`/positions/${id}`, body),
  remove: (id) => client.delete(`/positions/${id}`),
});

// Re-export the bare client in case low-level use is needed
export { client } from './client';


