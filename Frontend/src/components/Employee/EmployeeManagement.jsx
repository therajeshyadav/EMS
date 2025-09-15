import React, { useState, useContext, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Download } from "lucide-react";
import { AuthContext } from "../../context/Authprovider";
import AddEmployeeModal from "./AddEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import { EmployeesApi } from "../../api/api";

const EmployeeManagement = () => {
  const { authState, setAuthState } = useContext(AuthContext);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await EmployeesApi.list();
        setAuthState((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            employees: res.data.data || [],
          },
        }));
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    if (authState.token) {
      fetchEmployees();
    }
  }, [authState.token, setAuthState]);

  const filteredEmployees =
    authState.profile?.employees?.filter(
      (emp) =>
        emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        // 1️⃣ API call to delete from DB
        const res = await EmployeesApi.remove(id);

        if (res.data.success) {
          // 2️⃣ Update local state only after success
          const updatedEmployees = authState.profile.employees.filter(
            (emp) => emp._id !== id
          );
          setAuthState((prev) => ({
            ...prev,
            profile: { ...prev.profile, employees: updatedEmployees },
          }));

          alert("Employee deleted successfully");
        } else {
          alert(res.data.message || "Failed to delete employee");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Error deleting employee. Try again.");
      }
    }
  };

  const handleAddEmployee = async (newEmployee) => {
    try {
      const res = await EmployeesApi.create(newEmployee);
      if (res.data.success) {
        setAuthState((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            employees: [...(prev.profile.employees || []), res.data.data],
          },
        }));
        setShowAddModal(false); // ✅ close modal after success
      } else {
        console.error("Failed to add employee:", res.data.message);
      }
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      console.log('Updating employee:', editingEmployee._id, updatedEmployee);
      const res = await EmployeesApi.updateAdmin(editingEmployee._id, updatedEmployee);
      console.log('Update response:', res.data);
      
      if (res.data.success) {
        // Refresh the entire employee list to get updated data
        const employeesRes = await EmployeesApi.list();
        setAuthState((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            employees: employeesRes.data.data || [],
          },
        }));
        setShowEditModal(false);
        setEditingEmployee(null);
        alert("Employee updated successfully");
      } else {
        alert(res.data.message || "Failed to update employee");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert(`Error updating employee: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their information
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Search & Export */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="text-left p-4">Employee</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Department</th>
                <th className="text-left p-4">Position</th>
                <th className="text-left p-4">Join Date</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="table-row">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {employee.firstName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {employee.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{employee.email}</td>
                  <td className="p-4 text-gray-600">
                    {employee.department?.name || employee.department || "N/A"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {employee.position?.title || employee.position || "N/A"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(
                      employee.joiningDate || employee.joinDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`status-badge ${
                        employee.isActive ? "status-present" : "status-absent"
                      }`}
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditEmployee(employee)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEmployee}
        />
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => {
            setShowEditModal(false);
            setEditingEmployee(null);
          }}
          onUpdate={handleUpdateEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;
