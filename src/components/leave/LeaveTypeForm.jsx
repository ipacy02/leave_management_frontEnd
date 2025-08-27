 import React, { useState, useEffect } from 'react';
 import { useDispatch, useSelector } from 'react-redux';
 import { createLeaveType } from '../../redux/features/leaveFeature';
 import { toast,Toaster } from 'react-hot-toast';
 
 const CreateLeaveTypeForm = () => {
   const dispatch = useDispatch();
   const { isCreating, error, success, message } = useSelector(state => state.leave);
   
   // For simulating loading state
   const [simulatedLoading, setSimulatedLoading] = useState(false);
   
   // Initial state based on the provided DTO
   const [leaveTypeForm, setLeaveTypeForm] = useState({
     name: '',
     description: '',
     accrualRate: 0,
     requiresDoc: false,
     maxDays: 0,
     isActive: true
   });
   
   // Color picker for leave type
   const [selectedColor, setSelectedColor] = useState('#4F46E5');
   
   // Store toast ID for loading state
   const [loadingToastId, setLoadingToastId] = useState(null);
   
   // Handle loading state with toast
   useEffect(() => {
     // Use either the real loading state or our simulated one
     const isCurrentlyLoading = isCreating || simulatedLoading;
     
     if (isCurrentlyLoading && !loadingToastId) {
       const id = toast.loading('Creating leave type...', {
         position: 'top-center',
         style: {
           background: 'linear-gradient(to right, #3b82f6, #6366f1)',
           color: '#fff',
           borderRadius: '0.5rem',
           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
         },
       });
       setLoadingToastId(id);
     } else if (!isCurrentlyLoading && loadingToastId) {
       toast.dismiss(loadingToastId);
       setLoadingToastId(null);
     }
   }, [isCreating, simulatedLoading]);
   
   // Simulate successful completion after 4 seconds
   useEffect(() => {
     let timer;
     if (simulatedLoading) {
       timer = setTimeout(() => {
         setSimulatedLoading(false);
         
         // Show success message
         toast.success('Leave type created successfully!', {
           duration: 4000,
           position: 'top-center',
           style: {
             background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
             color: '#fff',
             borderRadius: '0.5rem',
             boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
           },
           icon: '✅',
         });
         
         resetForm();
       }, 4000); // 4 seconds simulation
     }
     
     return () => clearTimeout(timer);
   }, [simulatedLoading]);
   
   // Handle success message from Redux state
   useEffect(() => {
     if (success && message) {
       toast.success(message, {
         duration: 4000,
         position: 'top-center',
         style: {
           background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
           color: '#fff',
           borderRadius: '0.5rem',
           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
         },
         icon: '✅',
       });
       resetForm();
     }
   }, [success, message]);
 
   // Handle error message
   useEffect(() => {
     if (error) {
       toast.error(error, {
         duration: 4000,
         position: 'top-center',
         style: {
           background: 'linear-gradient(to right, #ef4444, #dc2626)',
           color: '#fff',
           borderRadius: '0.5rem',
           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
         },
         icon: '❌',
       });
     }
   }, [error]);
 
   const resetForm = () => {
     setLeaveTypeForm({
       name: '',
       description: '',
       accrualRate: 0,
       requiresDoc: false,
       maxDays: 0,
       isActive: true
     });
     setSelectedColor('#4F46E5');
   };
 
   const handleInputChange = (e) => {
     const { name, value, type, checked } = e.target;
     setLeaveTypeForm(prev => ({
       ...prev,
       [name]: type === 'checkbox' ? checked : 
               type === 'number' ? parseFloat(value) : value
     }));
   };
 
   const handleSubmit = (e) => {
     e.preventDefault();
     
     // Combine form data with selected color
     const leaveTypeData = {
       ...leaveTypeForm,
       color: selectedColor
     };
     
     // For development/demo purposes - simulate loading
     setSimulatedLoading(true);
     
     // In production, you would use this instead:
     // dispatch(createLeaveType(leaveTypeData));
   };
 
   // Predefined colors for selection
   const colorOptions = [
     '#4F46E5', // Indigo
     '#8B5CF6', // Violet
     '#EC4899', // Pink
     '#EF4444', // Red
     '#F59E0B', // Amber
     '#10B981', // Emerald
     '#3B82F6', // Blue
     '#6366F1'  // Indigo (lighter)
   ];
 
   // Use either the real loading state or our simulated one for UI
   const isCurrentlyLoading = isCreating || simulatedLoading;
 
   return (
     <>
     <Toaster/>
     <div className="bg-white rounded-lg shadow-md p-6">
       <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Leave Type</h2>
       
       <form onSubmit={handleSubmit}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type Name *</label>
             <input
               type="text"
               name="name"
               value={leaveTypeForm.name}
               onChange={handleInputChange}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
               placeholder="e.g., Annual Leave, Sick Leave"
               required
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Max Days Allowed *</label>
             <input
               type="number"
               name="maxDays"
               value={leaveTypeForm.maxDays}
               onChange={handleInputChange}
               min="0"
               step="1"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
               required
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Rate (Days per month)</label>
             <input
               type="number"
               name="accrualRate"
               value={leaveTypeForm.accrualRate}
               onChange={handleInputChange}
               min="0"
               step="0.01"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
             />
             <p className="text-xs text-gray-500 mt-1">Leave days earned per month. Set to 0 if not applicable.</p>
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
             <div className="flex flex-wrap gap-2">
               {colorOptions.map(color => (
                 <div 
                   key={color}
                   onClick={() => setSelectedColor(color)}
                   className={`h-8 w-8 rounded-full cursor-pointer transition-all duration-200 ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                   style={{ backgroundColor: color }}
                 ></div>
               ))}
             </div>
           </div>
           
           <div className="col-span-1 md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
             <textarea
               name="description"
               value={leaveTypeForm.description}
               onChange={handleInputChange}
               rows="3"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
               placeholder="Provide details about this leave type..."
             ></textarea>
           </div>
           
           <div>
             <div className="flex items-center">
               <input
                 type="checkbox"
                 id="requiresDoc"
                 name="requiresDoc"
                 checked={leaveTypeForm.requiresDoc}
                 onChange={handleInputChange}
                 className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
               />
               <label htmlFor="requiresDoc" className="ml-2 block text-sm text-gray-700">
                 Requires Documentation
               </label>
             </div>
             <p className="text-xs text-gray-500 mt-1">Check if supporting documents are required for this leave type</p>
           </div>
           
           <div>
             <div className="flex items-center">
               <input
                 type="checkbox"
                 id="isActive"
                 name="isActive"
                 checked={leaveTypeForm.isActive}
                 onChange={handleInputChange}
                 className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
               />
               <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                 Active Leave Type
               </label>
             </div>
             <p className="text-xs text-gray-500 mt-1">Uncheck to disable this leave type</p>
           </div>
         </div>
         
         <div className="mt-8 flex justify-end">
           <button
             type="button"
             onClick={resetForm}
             className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-all duration-200"
             disabled={isCurrentlyLoading}
           >
             Reset
           </button>
           <button
             type="submit"
             className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-md hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-2"
             disabled={isCurrentlyLoading}
           >
             {isCurrentlyLoading ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Creating...
               </>
             ) : (
               <>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                 </svg>
                 Create Leave Type
               </>
             )}
           </button>
         </div>
       </form>
     </div>
     </>
   );
 };
 
 export default CreateLeaveTypeForm;