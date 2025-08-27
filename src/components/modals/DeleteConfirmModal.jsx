import React from 'react';
import { X as XIcon } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Center modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Modal header */}
          <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">
              {title || 'Confirm Deletion'}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors focus:outline-none"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Modal body */}
          <div className="bg-white px-6 py-5">
            <div className="text-gray-700">
              {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;