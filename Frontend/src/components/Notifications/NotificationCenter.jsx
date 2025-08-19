import React, { useState } from 'react';
import { Bell, Send, Users, Calendar, DollarSign, CheckCircle, X } from 'lucide-react';

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showSendModal, setShowSendModal] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'leave',
      title: 'Leave Request Approved',
      message: 'Your leave request for Jan 20-22 has been approved.',
      time: '2 hours ago',
      read: false,
      icon: Calendar,
      color: 'green'
    },
    {
      id: 2,
      type: 'payroll',
      title: 'Payslip Generated',
      message: 'Your January payslip is now available for download.',
      time: '1 day ago',
      read: true,
      icon: DollarSign,
      color: 'blue'
    },
    {
      id: 3,
      type: 'task',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Website Redesign"',
      time: '2 days ago',
      read: false,
      icon: CheckCircle,
      color: 'purple'
    },
    {
      id: 4,
      type: 'general',
      title: 'Company Meeting',
      message: 'All-hands meeting scheduled for tomorrow at 10 AM.',
      time: '3 days ago',
      read: true,
      icon: Users,
      color: 'yellow'
    }
  ];

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === activeTab);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const markAsRead = (id) => {
    console.log('Marking notification as read:', id);
  };

  const deleteNotification = (id) => {
    console.log('Deleting notification:', id);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with important announcements</p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Important</p>
              <p className="text-2xl font-bold text-yellow-600">3</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl card-shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'all', name: 'All Notifications' },
              { id: 'leave', name: 'Leave' },
              { id: 'payroll', name: 'Payroll' },
              { id: 'task', name: 'Tasks' },
              { id: 'general', name: 'General' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="divide-y divide-gray-200">
          {filteredNotifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notification.color === 'green' ? 'bg-green-100' :
                    notification.color === 'blue' ? 'bg-blue-100' :
                    notification.color === 'purple' ? 'bg-purple-100' :
                    notification.color === 'yellow' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      notification.color === 'green' ? 'text-green-600' :
                      notification.color === 'blue' ? 'text-blue-600' :
                      notification.color === 'purple' ? 'text-purple-600' :
                      notification.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Send Notification</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <select className="input-field">
                  <option>All Employees</option>
                  <option>IT Department</option>
                  <option>HR Department</option>
                  <option>Specific Employee</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Notification message"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;