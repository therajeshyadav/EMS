import React, { useState } from 'react';
import { Edit, Save, X, User, Mail, Phone, MapPin, Calendar, Briefcase, Heart } from 'lucide-react';

const EmployeeProfile = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    address: data?.address || '',
    department: data?.department || 'IT',
    position: data?.position || 'Developer',
    joinDate: data?.joinDate || '2024-01-01',
    dateOfBirth: data?.dateOfBirth || '',
    bloodGroup: data?.bloodGroup || '',
    emergencyContact: data?.emergencyContact || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Here you would typically update the employee data
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center space-x-2 ${
            isEditing ? 'bg-red-500 hover:bg-red-600' : 'btn-primary'
          } text-white px-4 py-2 rounded-lg`}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 card-shadow text-center">
            <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-gray-600 mb-2">{formData.position}</p>
            <p className="text-sm text-gray-500">{formData.department} Department</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Employee ID:</span>
                <span className="font-medium">{data?.id}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Join Date:</span>
                <span className="font-medium">{formData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formData.dateOfBirth || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-2" />
                  Blood Group
                </label>
                {isEditing ? (
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{formData.bloodGroup || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.address || 'Not provided'}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Name and phone number"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.emergencyContact || 'Not provided'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;