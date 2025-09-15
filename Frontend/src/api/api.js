// api.js
import axios from "axios";

// ======================== AXIOS CLIENT ========================  //

const client = axios.create({
  baseURL: "http://localhost:5003/api", // Back to working localhost for now
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically from localStorage  //

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ======================== AUTH ========================  //

export const AuthApi = {
  login: async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    console.log(data);
    return data;
  },
  signup: async (payload) => {
    const { data } = await client.post("/auth/signup", payload);
    return data;
  },
};

// ======================== EMPLOYEES ========================  //

export const EmployeesApi = {
  list: () => client.get("/employees"),
  me: () => client.get("/employees/me"),
  get: (id) => client.get(`/employees/${id}`),
  create: (body) => client.post("/employees", body),
  update: (id, body) => client.put(`/employees/${id}`, body),
  updateAdmin: (id, body) => client.put(`/employees/update/${id}`, body),
  remove: (id) => client.delete(`/employees/${id}`),
  stats: (id) => client.get(`/employees/stats/${id}`),
};

// ======================== ATTENDANCE ========================  //

export const AttendanceApi = {
  list: (params) => client.get("/attendance", { params }),
  me: (page = 1, limit = 3) =>
    client.get("/attendance/me", { params: { page, limit } }),
  adminget: (params = {}) => client.get("/attendance", { params }),
  checkIn: (body) => client.post("/attendance/check-in", body),
  checkOut: (body) => client.post("/attendance/check-out", body),
  update: (id, body) => client.put(`/attendance/${id}`, body),
  reports: (params) => client.get("/attendance/reports", { params }),
};

// ======================== LEAVES ========================  //

export const LeavesApi = {
  list: (params) => client.get("/leaves", { params }),
  create: (body) => client.post("/leaves", body),
  approve: (id) => client.put(`/leaves/${id}/approve`, {}),
  reject: (id, body) => client.put(`/leaves/${id}/reject`, body),
  balance: (employeeId) => client.get(`/leaves/balance/${employeeId}`),
  me: (params) => client.get("/leaves/me", { params }),
};

// ======================== TASKS ======================== //

export const TasksApi = {
  list: () => client.get("/tasks"),
  mine: (employeeId, params) =>
    client.get(`/tasks/me/${employeeId}`, { params }),
  get: (id) => client.get(`/tasks/${id}`),
  create: (body) => client.post("/tasks", body),
  update: (id, body) => client.put(`/tasks/${id}`, body),
  remove: (id) => client.delete(`/tasks/${id}`),
  setStatus: (id, status) => client.patch(`/tasks/${id}/status`, { status }),
};

// ======================== PAYROLL ========================
export const PayrollApi = {
  list: (params) => client.get("/payroll", { params }),
  getme: (page = 1, limit = 4) =>
    client.get(`/payroll/my?page=${page}&limit=${limit}`),
  generate: (body) => client.post("/payroll/generate", body),
  process: (body) => client.post("/payroll/process", body),
  payslip: (employeeId, month, year) =>
    client.get(`/payroll/payslip/${employeeId}`, {
      params: { month, year },
    }),
  markPaid: (employeeId, payload) =>
    client.put(`/payroll/${employeeId}/mark-paid`, payload),
};

// ======================== NOTIFICATIONS ========================
export const NotificationsApi = {
  list: (params) => client.get("/notifications", { params }),
  create: (body) => client.post("/notifications", body),
  markRead: (id) => client.put(`/notifications/${id}/read`, {}),
  delete: (id) => client.delete(`/notifications/${id}`),
};

// ======================== DEPARTMENTS ========================
export const DepartmentsApi = {
  list: (params) => client.get("/departments", { params }),
  get: (id) => client.get(`/departments/${id}`),
  create: (body) => client.post("/departments", body),
  update: (id, body) => client.put(`/departments/${id}`, body),
  remove: (id) => client.delete(`/departments/${id}`),
  employees: (id, params) =>
    client.get(`/departments/${id}/employees`, { params }),
  stats: (id) => client.get(`/departments/${id}/stats`),
  setHead: (id, headId) => client.put(`/departments/${id}/head`, { headId }),
};

// ======================== POSITIONS ========================
export const PositionsApi = {
  list: (params) => client.get("/positions", { params }),
  get: (id) => client.get(`/positions/${id}`),
  create: (body) => client.post("/positions", body),
  update: (id, body) => client.put(`/positions/${id}`, body),
  remove: (id) => client.delete(`/positions/${id}`),
};

// ======================== POSITIONS ========================
export const ReportsApi = {
  getAttendance: (startDate, endDate) => client.post(`/reports/attendance` , { startDate, endDate },),
  exportAttendance: (startDate, endDate, format) =>
    client.post(
      `/reports/attendance/export/${format}`,
      { startDate, endDate },
      {
        responseType: "blob", 
      }
    ),
};

// ======================== EXPORT ========================
export default {
  AuthApi,
  EmployeesApi,
  AttendanceApi,
  LeavesApi,
  TasksApi,
  PayrollApi,
  NotificationsApi,
  DepartmentsApi,
  PositionsApi,
};
