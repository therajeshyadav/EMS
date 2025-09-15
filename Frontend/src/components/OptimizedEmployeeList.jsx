// components/OptimizedEmployeeList.jsx
import React, { useState, useMemo } from 'react';
import VirtualizedTable from './VirtualizedTable';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import usePagination from '../hooks/usePagination';

const OptimizedEmployeeList = () => {
  const [viewMode, setViewMode] = useState('pagination'); // 'pagination' | 'infinite'
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: 'all'
  });

  // Pagination mode
  const {
    data: paginatedData,
    loading: paginationLoading,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    refresh
  } = usePagination('/api/employees', {
    limit: 20,
    dependencies: [filters],
    enabled: viewMode === 'pagination',
    transform: (data) => data || []
  });

  // Infinite scroll mode
  const {
    data: infiniteData,
    loading: infiniteLoading,
    hasMore,
    loadMore
  } = useInfiniteScroll('/api/employees', {
    limit: 20,
    dependencies: [filters],
    enabled: viewMode === 'infinite',
    transform: (data) => data || []
  });

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'employeeId',
      header: 'Employee ID',
      width: '120px',
      render: (item) => (
        <span className="font-mono text-sm">{item.employeeId}</span>
      )
    },
    {
      key: 'name',
      header: 'Name',
      width: '200px',
      render: (item) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
            {item.firstName?.[0]}{item.lastName?.[0]}
          </div>
          <span>{item.firstName} {item.lastName}</span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      width: '250px',
      render: (item) => (
        <span className="text-gray-600">{item.email}</span>
      )
    },
    {
      key: 'department',
      header: 'Department',
      width: '150px',
      render: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {item.department?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'position',
      header: 'Position',
      width: '150px',
      render: (item) => (
        <span className="text-gray-700">{item.position?.title || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          item.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: (item) => (
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            Edit
          </button>
          <button className="text-red-600 hover:text-red-800 text-sm">
            Delete
          </button>
        </div>
      )
    }
  ], []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Get current data based on view mode
  const currentData = viewMode === 'pagination' ? paginatedData : infiniteData;
  const isLoading = viewMode === 'pagination' ? paginationLoading : infiniteLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        
        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('pagination')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'pagination'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pagination
          </button>
          <button
            onClick={() => setViewMode('infinite')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'infinite'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Infinite Scroll
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search employees..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="hr">Human Resources</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading && currentData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <VirtualizedTable
            data={currentData}
            columns={columns}
            rowHeight={60}
            containerHeight={600}
            onLoadMore={viewMode === 'infinite' ? loadMore : undefined}
            hasMore={viewMode === 'infinite' ? hasMore : false}
            loading={isLoading}
            keyField="employeeId"
          />
        )}
      </div>

      {/* Pagination Controls (only for pagination mode) */}
      {viewMode === 'pagination' && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * 20) + 1} to{' '}
            {Math.min(pagination.currentPage * 20, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={prevPage}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={nextPage}
              disabled={!pagination.hasNext}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Performance Stats */}
      <div className="text-xs text-gray-500 text-center">
        {viewMode === 'pagination' 
          ? `Page ${pagination.currentPage} of ${pagination.totalPages} • ${pagination.totalItems} total items`
          : `${currentData.length} items loaded • ${hasMore ? 'More available' : 'All loaded'}`
        }
      </div>
    </div>
  );
};

export default OptimizedEmployeeList;