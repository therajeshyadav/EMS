import React, { useState, useContext } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download } from 'lucide-react';
import { AuthContext } from '../../context/Authprovider';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeeManagement = () => {
  const [userData, setUserData] = useContext(AuthContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const filteredEmployees = userData.employees?.filter(emp =>
    emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const updatedEmployees = userData.employees.filter(emp => emp.id !== id);
      setUserData({ ...userData, employees: updatedEmployees });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>

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
                <tr key={employee.id} className="table-row">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {employee.firstName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.firstName}</p>
                        <p className="text-sm text-gray-500">ID: {employee.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{employee.email}</td>
                  <td className="p-4 text-gray-600">{employee.department || 'IT'}</td>
                  <td className="p-4 text-gray-600">{employee.position || 'Developer'}</td>
                  <td className="p-4 text-gray-600">{employee.joinDate || '2024-01-01'}</td>
                  <td className="p-4">
                    <span className="status-badge status-present">Active</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
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

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newEmployee) => {
            const updatedEmployees = [...userData.employees, { ...newEmployee, id: Date.now() }];
            setUserData({ ...userData, employees: updatedEmployees });
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;