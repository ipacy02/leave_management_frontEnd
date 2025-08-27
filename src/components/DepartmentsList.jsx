import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllDepartments, 
  selectDepartments, 
  deleteDepartment,
  assignDepartmentHead,
  removeDepartmentHead
} from '../redux/features/departmentsSlice';
import { getAllUsers, selectUsers } from '../redux/features/usersSlice';
import DepartmentFormModal from '../components/modals/DepartmentFormModal';
import { Trash, Edit, UserPlus, UserMinus } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import AlertMessage from '../components/common/AlertMessage';

const DepartmentsList = () => {
  const dispatch = useDispatch();
  const { departments, loading, error, success, message } = useSelector(selectDepartments);
  const { users, loading: usersLoading } = useSelector(selectUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [actionPerformed, setActionPerformed] = useState(false);
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [selectedHeadDepartment, setSelectedHeadDepartment] = useState(null);
  const [selectedHeadId, setSelectedHeadId] = useState('');
  
  // Filter managers from users list
  const managers = users ? users.filter(user => user.role === 'MANAGER') : [];

  useEffect(() => {
    dispatch(fetchAllDepartments());
    dispatch(getAllUsers()); // Fetch all users instead of just managers
  }, [dispatch]);

  useEffect(() => {
    if (actionPerformed) {
      dispatch(fetchAllDepartments());
      setActionPerformed(false);
    }
  }, [actionPerformed, dispatch]);

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      dispatch(deleteDepartment(id))
        .unwrap()
        .then(() => setActionPerformed(true))
        .catch(error => console.error('Error deleting department:', error));
    }
  };

  const handleAssignHead = (department) => {
    setSelectedHeadDepartment(department);
    setSelectedHeadId(department.headId || '');
    setShowHeadModal(true);
  };

  const handleRemoveHead = (departmentId) => {
    if (window.confirm('Are you sure you want to remove the department head?')) {
      dispatch(removeDepartmentHead(departmentId))
        .unwrap()
        .then(() => setActionPerformed(true))
        .catch(error => console.error('Error removing department head:', error));
    }
  };

  const handleHeadAssignmentSubmit = (e) => {
    e.preventDefault();
    
    if (selectedHeadId) {
      dispatch(assignDepartmentHead({ 
        departmentId: selectedHeadDepartment.id, 
        headId: selectedHeadId 
      }))
        .unwrap()
        .then(() => {
          setActionPerformed(true);
          setShowHeadModal(false);
        })
        .catch(error => console.error('Error assigning department head:', error));
    }
  };

  const findManagerName = (headId) => {
    if (!headId) return 'Not Assigned';
    const manager = managers.find(m => m.id === headId);
    return manager ? manager.fullName : 'Unknown';
  };

  if (loading && departments.length === 0) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments Management</h1>
        <button
          onClick={handleCreateDepartment}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-colors"
        >
          Add Department
        </button>
      </div>

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={message} />}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Head</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.length > 0 ? (
              departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{department.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md truncate">{department.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {findManagerName(department.headId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleAssignHead(department)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Assign Department Head"
                      >
                        <UserPlus className="h-5 w-5" />
                      </button>
                      {department.headId && (
                        <button
                          onClick={() => handleRemoveHead(department.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove Department Head"
                        >
                          <UserMinus className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditDepartment(department)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Department Form Modal */}
      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDepartment}
        setActionPerformed={setActionPerformed}
        managers={managers} // Pass managers directly to the modal
      />

      {/* Department Head Assignment Modal */}
      {showHeadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Center modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h3 className="text-lg font-medium text-white">
                  Assign Department Head
                </h3>
              </div>
              
              <div className="bg-white px-6 py-5">
                <form onSubmit={handleHeadAssignmentSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="headId" className="block text-sm font-medium text-gray-700 mb-1">
                      Department: {selectedHeadDepartment?.name}
                    </label>
                    <select
                      id="headId"
                      name="headId"
                      value={selectedHeadId}
                      onChange={(e) => setSelectedHeadId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">-- Select Department Head --</option>
                      {managers.length > 0 ? (
                        managers.map(manager => (
                          <option key={manager.id} value={manager.id}>
                            {manager.fullName} ({manager.email})
                          </option>
                        ))
                      ) : (
                        <option disabled>No managers available</option>
                      )}
                    </select>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowHeadModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Assign Head
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsList;