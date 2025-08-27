import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ src, name, size = 40, className = '' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  const getRandomColor = (name) => {
    if (!name) return '#3498db';
    
    // Generate a consistent color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
      '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
    ];
    
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };
  
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`,
  };
  
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User Avatar'}
        className={`rounded-full object-cover ${className}`}
        style={style}
      />
    );
  }
  
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium ${className}`}
      style={{
        ...style,
        backgroundColor: getRandomColor(name),
      }}
    >
      {getInitials(name)}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};

export default Avatar;