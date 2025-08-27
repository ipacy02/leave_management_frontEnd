import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;
  
  // Function to handle page change
  const handlePageChange = (page) => {
    // Validate page is within range
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  // Function to generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range of pages to show around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...');
    }
    
    // Add pages in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-700">
        Showing page {currentPage} of {totalPages}
      </div>
      
      <div className="flex space-x-1">
        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <button
            key={`${page}-${index}`}
            onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
            disabled={page === '...'}
            className={`px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              page === currentPage
                ? 'bg-indigo-600 text-white'
                : page === '...'
                  ? 'text-gray-500 cursor-default'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;