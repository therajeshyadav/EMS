// src/pages/Employee/EmployeeProfile.jsx
import React, { useContext, useState, useEffect } from "react";
import { Edit, Save, X, User, MapPin, Phone } from "lucide-react";
import { AuthContext } from "../../context/Authprovider";
import { EmployeesApi } from "../../api/api";

const EmployeeProfile = ({ data }) => {
  const { authState, setAuthState } = useContext(AuthContext);
  const profile = authState?.profile;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // ✅ initialize form when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        department: profile.department?.name || "",
        position: profile.position?.title || "",
        joinDate: profile.joiningDate || "",
        dateOfBirth: profile.dateOfBirth || "",
        bloodGroup: profile.bloodGroup || "",
        emergencyContact: profile.emergencyContact || {
          name: "",
          phone: "",
          relationship: "",
        },
        employeeId: profile.employeeId,
      });
    }
  }, [profile]);
  console.log("authState in EmployeeProfile:", authState);

  // Normal input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Nested object input (address & emergencyContact)
  const handleNestedChange = (e, parent) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSave = async () => {
    try {
      const id = data?.employeeId;
      if (!id) return setIsEditing(false);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact,
      };

      // update API
      await EmployeesApi.update(`${id}`, payload);

      // refresh profile
      const refreshed = await EmployeesApi.me();
      if (refreshed.data.success) {
        setAuthState((prev) => ({
          ...prev,
          profile: refreshed.data.data,
        }));
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setIsEditing(false);
    }
  };

  if (!profile) {
    return <p className="text-center text-gray-500">Loading profile...</p>;
  }

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
            isEditing ? "bg-red-500 hover:bg-red-600" : "btn-primary"
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
        {/* Left Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 card-shadow text-center">
            <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-gray-600 mb-2">{formData.position}</p>
            <p className="text-sm text-gray-500">
              {formData.department} Department
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Employee ID:</span>
                <span className="font-medium">{formData.employeeId}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Join Date:</span>
                <span className="font-medium">
                  {formData.joinDate?.slice(0, 10) || "Not Provided"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                isEditing={isEditing}
                handleChange={handleChange}
              />
              <InputField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                isEditing={isEditing}
                handleChange={handleChange}
              />
              <InputField
                label="Email"
                name="email"
                value={formData.email}
                isEditing={isEditing}
                handleChange={handleChange}
              />
              <InputField
                label="Phone"
                name="phone"
                value={formData.phone}
                isEditing={isEditing}
                handleChange={handleChange}
              />
              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth?.slice(0, 10)}
                isEditing={isEditing}
                handleChange={handleChange}
              />
              <SelectField
                label="Blood Group"
                name="bloodGroup"
                value={formData.bloodGroup}
                isEditing={isEditing}
                handleChange={handleChange}
              />
            </div>

            {/* Address */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["street", "city", "state", "zipCode", "country"].map(
                    (field) => (
                      <input
                        key={field}
                        type="text"
                        name={field}
                        placeholder={field}
                        value={formData.address?.[field] || ""}
                        onChange={(e) => handleNestedChange(e, "address")}
                        className="input-field"
                      />
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-900 py-2">
                  {formData.address?.street}, {formData.address?.city},{" "}
                  {formData.address?.state} {formData.address?.zipCode},{" "}
                  {formData.address?.country}
                </p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Emergency Contact
              </label>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["name", "phone", "relationship"].map((field) => (
                    <input
                      key={field}
                      type="text"
                      name={field}
                      placeholder={field}
                      value={formData.emergencyContact?.[field] || ""}
                      onChange={(e) =>
                        handleNestedChange(e, "emergencyContact")
                      }
                      className="input-field"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-900 py-2">
                  {formData.emergencyContact?.name} (
                  {formData.emergencyContact?.relationship}) -{" "}
                  {formData.emergencyContact?.phone}
                </p>
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

// Reusable Input
const InputField = ({
  label,
  name,
  value,
  handleChange,
  isEditing,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        className="input-field"
      />
    ) : (
      <p className="text-gray-900 py-2">{value || "Not Provided"}</p>
    )}
  </div>
);

// Blood Group Select
const SelectField = ({ label, name, value, handleChange, isEditing }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {isEditing ? (
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="input-field"
      >
        <option value="">Select</option>
        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
          <option key={bg} value={bg}>
            {bg}
          </option>
        ))}
      </select>
    ) : (
      <p className="text-gray-900 py-2">{value || "Not Provided"}</p>
    )}
  </div>
);

export default EmployeeProfile;
