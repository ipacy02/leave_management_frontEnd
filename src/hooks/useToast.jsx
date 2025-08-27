import { useState, useEffect } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState(null);
  
  // Auto dismiss toast after specified duration
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration || 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Function to show a toast message
  const showToast = (type, message, duration = 3000) => {
    setToast({
      type,
      message,
      duration,
      id: Date.now(), // Unique ID to help with key prop in rendering
    });
  };
  
  // Function to manually dismiss the toast
  const dismissToast = () => {
    setToast(null);
  };
  
  // Toast component to be rendered in your app layout
  const ToastComponent = () => {
    if (!toast) return null;
    
    // Define styles based on toast type
    const styles = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    };
    
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <div 
          className={`${styles[toast.type] || styles.info} text-white py-3 px-4 rounded-md shadow-lg flex items-center justify-between max-w-md`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button 
            onClick={dismissToast}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  return {
    showToast,
    dismissToast,
    ToastComponent,
    toast,
  };
};
