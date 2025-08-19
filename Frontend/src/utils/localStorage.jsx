const employees = [
  {
    id: 1,
    firstName: "Amit",
    email: "employee1@example.com",
    password: "123",
    tasks: [
      {
        taskTitle: "Prepare Monthly Report",
        taskDescription: "Compile financial data for the monthly report.",
        taskDate: "2025-03-10",
        category: "Finance",
        active: true,
        newTask: false,
        completed: false,
        failure: false,
      },
      {
        taskTitle: "Client Meeting",
        taskDescription: "Discuss project updates with the client.",
        taskDate: "2025-03-11",
        category: "Business",
        active: false,
        newTask: true,
        completed: false,
        failure: false,
      },
    ],
    taskNumber: 2,
    activeTasks: 1,
    newTasks: 1,
    completedTasks: 0,
    failedTasks: 0,
  },
  {
    id: 2,
    firstName: "Priya",
    email: "employee2@example.com",
    password: "123",
    tasks: [
      {
        taskTitle: "Code Review",
        taskDescription: "Review the newly submitted PRs.",
        taskDate: "2025-03-12",
        category: "Development",
        active: true,
        newTask: false,
        completed: false,
        failure: false,
      },
      {
        taskTitle: "Fix Bug #2345",
        taskDescription: "Resolve critical bug in production.",
        taskDate: "2025-03-13",
        category: "Development",
        active: true,
        newTask: true,
        completed: false,
        failure: false,
      },
    ],
    taskNumber: 2,
    activeTasks: 2,
    newTasks: 1,
    completedTasks: 0,
    failedTasks: 0,
  },
  {
    id: 3,
    firstName: "Rajesh",
    email: "employee3@example.com",
    password: "123",
    tasks: [
      {
        taskTitle: "Marketing Campaign",
        taskDescription: "Plan next month’s digital marketing campaign.",
        taskDate: "2025-03-14",
        category: "Marketing",
        active: true,
        newTask: true,
        completed: false,
        failure: false,
      },
    ],
    taskNumber: 1,
    activeTasks: 1,
    newTasks: 1,
    completedTasks: 0,
    failedTasks: 0,
  },
  {
    id: 4,
    firstName: "Neha",
    email: "employee4@example.com",
    password: "123",
    tasks: [
      {
        taskTitle: "Customer Support",
        taskDescription: "Resolve pending customer complaints.",
        taskDate: "2025-03-15",
        category: "Support",
        active: false,
        newTask: false,
        completed: true,
        failure: false,
      },
    ],
    taskNumber: 1,
    activeTasks: 0,
    newTasks: 0,
    completedTasks: 1,
    failedTasks: 0,
  },
  {
    id: 5,
    firstName: "Vikram",
    email: "employee5@example.com",
    password: "123",
    tasks: [
      {
        taskTitle: "Inventory Check",
        taskDescription: "Audit current stock levels in warehouse.",
        taskDate: "2025-03-16",
        category: "Operations",
        active: true,
        newTask: false,
        completed: false,
        failure: false,
      },
    ],
    taskNumber: 1,
    activeTasks: 1,
    newTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
  },
];

const admin = [
  {
    id: 1,
    firstName: "Ravi",
    email: "admin@example.com",
    password: "123",
  },
];

export const setLocalStorage = () => {
  localStorage.setItem("employees", JSON.stringify(employees));
  localStorage.setItem("admin", JSON.stringify(admin));
};
export const getLocalStorage = () => {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  const admin = JSON.parse(localStorage.getItem("admin")) || [];
  return { employees, admin };
};
