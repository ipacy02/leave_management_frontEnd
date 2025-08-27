import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllManagers, selectUsers } from '../redux/features/usersSlice';
import { toast } from 'react-hot-toast';

const ManagersDisplay = () => {
  const dispatch = useDispatch();
  const { managers, loading, error } = useSelector(selectUsers);

  useEffect(() => {
    dispatch(getAllManagers())
      .unwrap()
      .then(() => {
        toast.success('Managers loaded successfully!', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
            color: '#fff',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          icon: '👋',
        });
      })
      .catch((err) => {
        toast.error(`Failed to load managers: ${err.message}`, {
          duration: 4000,
          position: 'top-center',
        });
      });
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Management Team</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {managers && managers.length > 0 ? (
          managers.map((manager) => (
            <div
              key={manager.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105"
            >
              <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center">
                {manager.profilePicture ? (
                  <img
                    src={manager.profilePicture}
                    alt={manager.fullName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white">
                    <span className="text-3xl font-bold text-gray-500">
                      {manager.fullName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800 truncate">{manager.fullName}</h2>
                <p className="text-indigo-600 font-semibold mb-2">{manager.role}</p>
                <p className="text-gray-600 text-sm truncate">{manager.email}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-2 rounded-md hover:opacity-90 transition-opacity">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 text-lg">No managers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagersDisplay;