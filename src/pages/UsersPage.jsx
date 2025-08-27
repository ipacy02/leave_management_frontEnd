import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllUsers,
  deleteUser,
  searchUsers,
  getUsersByRole,
  getUsersByDepartment,
  selectUsers
} from '../redux/features/usersSlice';
import { fetchAllDepartments } from '../redux/features/departmentsSlice';
import { 
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Filter,
  X as XIcon,
  RefreshCw 
} from 'lucide-react';
import UserFormModal from '../components/modals/UserFormModal ';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import { useToast } from '../hooks/useToast';
import Pagination from '../components/common/Pagination';

const UsersPage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { users, loading, error, success, message } = useSelector(selectUsers);
  const { departments } = useSelector(state => state.departments);
  
  // State for modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionPerformed, setActionPerformed] = useState(false);
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);
  
  // Load users and departments on component mount
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(fetchAllDepartments());
  }, [dispatch]);
  
  // Handle success and error messages
  useEffect(() => {
    if (success && actionPerformed) {
      showToast('success', message || 'Operation completed successfully');
      setActionPerformed(false);
    }
    
    if (error && actionPerformed) {
      showToast('error', error);
      setActionPerformed(false);
    }
  }, [success, error, message, actionPerformed, showToast]);

  // Handle search and filters
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(searchUsers(searchTerm));
    } else {
      dispatch(getAllUsers());
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    dispatch(getAllUsers());
  };

  const handleRoleFilterChange = (e) => {
    const role = e.target.value;
    setRoleFilter(role);
    setCurrentPage(1);
    
    if (role) {
      dispatch(getUsersByRole(role));
    } else if (departmentFilter) {
      dispatch(getUsersByDepartment(departmentFilter));
    } else {
      dispatch(getAllUsers());
    }
  };

  const handleDepartmentFilterChange = (e) => {
    const departmentId = e.target.value;
    setDepartmentFilter(departmentId);
    setCurrentPage(1);
    
    if (departmentId) {
      dispatch(getUsersByDepartment(departmentId));
    } else if (roleFilter) {
      dispatch(getUsersByRole(roleFilter));
    } else {
      dispatch(getAllUsers());
    }
  };

  const clearFilters = () => {
    setRoleFilter('');
    setDepartmentFilter('');
    setCurrentPage(1);
    dispatch(getAllUsers());
  };

  // Handle modal actions
  const openUserModal = (user = null) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      setActionPerformed(true);
      dispatch(deleteUser(userToDelete.id));
      setIsDeleteModalOpen(false);
    }
  };

  // Get display role name
  const getRoleName = (role) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'MANAGER': return 'Manager';
      case 'EMPLOYEE': return 'Employee';
      default: return role;
    }
  };

  // Get department name by ID
  const getDepartmentName = (id) => {
    const department = departments?.find(dept => dept.id === id);
    return department ? department.name : 'Not Assigned';
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
        
        <button
          onClick={() => openUserModal()}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add New User
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
          
          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Filter className="h-5 w-5 mr-1" />
              Filters
              {(roleFilter || departmentFilter) && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                  {(roleFilter ? 1 : 0) + (departmentFilter ? 1 : 0)}
                </span>
              )}
            </button>
            
            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-700">Filter Users</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reset
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={roleFilter}
                        onChange={handleRoleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EMPLOYEE">Employee</option>
                      </select>
                    </div>
                    
                    {/* Department Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={departmentFilter}
                        onChange={handleDepartmentFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Departments</option>
                        {departments?.map(department => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No users found. Try a different search or filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePicUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profilePicUrl}
                              alt={user.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-medium">
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'MANAGER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'MANAGER' && <UserCheck className="h-3 w-3 mr-1" />}
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.departmentId ? getDepartmentName(user.departmentId) : 'Not Assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.manager ? user.manager.fullName : 'No Manager'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {users.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      
      {/* User Form Modal */}
      <UserFormModal 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        setActionPerformed={setActionPerformed}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.fullName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default UsersPage;