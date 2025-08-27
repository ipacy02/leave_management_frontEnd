import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Mouse,
  User, 
  ChevronDown,
  Clock,
  BarChart,
  Briefcase,
  Zap,
  Building,
  UserCircle,
  Check as CheckIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { logout } from '../redux/features/authSlice';
import { 
  fetchUnreadNotifications,
  selectNotifications,
  markNotificationAsRead 
} from '../redux/features/NotificationSlice';

// Notification Item Component
const NotificationItem = ({ notification }) => {
  const dispatch = useDispatch();
  
  const handleMarkAsRead = () => {
    if (notification.isRead) return;
    
    dispatch(markNotificationAsRead(notification.id))
      .unwrap()
      .then(() => {
        toast.success('Notification marked as read', { duration: 2000 });
      })
      .catch((err) => {
        toast.error(err?.error || 'Failed to mark notification as read');
      });
  };
  
  // Format notification time
  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : 'recently';
  
  // Determine icon based on notification type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'LEAVE_REQUEST':
        return <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-500">📅</div>;
      case 'LEAVE_APPROVED':
        return <div className="h-10 w-10 flex items-center justify-center bg-green-100 rounded-full text-green-500">✓</div>;
      case 'LEAVE_REJECTED':
        return <div className="h-10 w-10 flex items-center justify-center bg-red-100 rounded-full text-red-500">✗</div>;
      case 'SYSTEM':
        return <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500">🔔</div>;
      default:
        return <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-500">🔔</div>;
    }
  };
  
  return (
    <div className={`px-4 py-3 border-b hover:bg-gray-50 flex items-start gap-3 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
      {getNotificationIcon()}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
            {notification.message}
          </p>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {timeAgo}
          </span>
        </div>
        
        {notification.data && (
          <div className="mt-1 text-xs text-gray-600">
            {notification.data.additionalInfo}
          </div>
        )}
      </div>
      
      {!notification.isRead && (
        <button 
          onClick={handleMarkAsRead}
          className="ml-2 p-1 text-blue-600 hover:text-blue-800"
          title="Mark as read"
        >
          <CheckIcon size={16} />
        </button>
      )}
    </div>
  );
};

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Get user information from Redux store
  const { user } = useSelector((state) => state.auth);
  const { unreadNotifications, unreadLoading } = useSelector(selectNotifications);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // For debugging: Log the user object to see if role is present
  useEffect(() => {
    console.log("Current user from Redux:", user);
  }, [user]);
  
  // Ensure user role is available by checking token if needed
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Try to get user role from Redux first
    if (user?.role) {
      setUserRole(user.role);
    } else {
      // If not available in Redux, try to get from token in localStorage
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Get payload part of JWT (second part)
          const payload = token.split('.')[1];
          // Decode base64
          const decodedPayload = JSON.parse(atob(payload));
          console.log("Decoded token payload:", decodedPayload);
          // Get role from token if available
          const roleFromToken = decodedPayload.role || decodedPayload.userRole || 'STAFF';
          setUserRole(roleFromToken);
          console.log("Role set from token:", roleFromToken);
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        // Default to STAFF if can't determine role
        setUserRole('STAFF');
      }
    }
  }, [user]);
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch unread notifications
  useEffect(() => {
    // Fetch unread notifications when component mounts
    dispatch(fetchUnreadNotifications());
    
    // Set up polling for notifications (every 2 minutes)
    const interval = setInterval(() => {
      dispatch(fetchUnreadNotifications());
    }, 120000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  // Role-based navigation items with explicit icon components
  const getNavigationItems = () => {
    // Common navigation items for all roles
    const commonItems = [
     
      { name: 'Calendar', icon: Calendar, href: '/dashboard/leave-calendar', current: location.pathname.includes('/leave-calendar') },
      { name: 'My Applications', icon: FileText, href: '/dashboard/my-applications', current: location.pathname.includes('/my-applications') },
      { name: 'Profile', icon: UserCircle, href: '/dashboard/profile', current: location.pathname.includes('/profile') },
      { name: 'Notifications', icon: Bell, href: '/dashboard/notifications', current: location.pathname.includes('/notifications') },
      
    ];
    
    // Manager-specific items
    const managerItems = [
      { name: 'Team Overview', icon: Users, href: '/dashboard/team-overview', current: location.pathname.includes('/team-overview') },
      { name: 'Approvals', icon: Zap, href: '/dashboard/approvals', current: location.pathname.includes('/approvals') },
    ];
    
    // Admin-specific items
    const adminItems = [
      { name: 'Dashboard', icon: Home, href: '/dashboard', current: location.pathname === '/dashboard' },
      { name: 'Users', icon: Users, href: '/dashboard/users', current: location.pathname.includes('/users') },
      { name: 'Departments', icon: Building, href: '/dashboard/departments', current: location.pathname.includes('/departments') },
      { name: 'Reports', icon: BarChart, href: '/dashboard/reports', current: location.pathname.includes('/reports') },
      { name: 'Leave Management', icon: Mouse, href: '/dashboard/leavemanagement', current: location.pathname.includes('/leavemanagement') } 
      
    ];
    
    console.log("Current user role:", userRole);
    
    // Return different navigation items based on user role
    // Using uppercase to ensure case-insensitive comparison
    const role = userRole?.toUpperCase();
    
    if (role === 'ADMIN') {
      console.log("Returning admin navigation items");
      return [...commonItems, ...managerItems, ...adminItems];
    } else if (role === 'MANAGER') {
      console.log("Returning manager navigation items");
      return [...commonItems, ...managerItems];
    } else {
      console.log("Returning common navigation items");
      return commonItems;
    }
  };
  
  const navigationItems = getNavigationItems();
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const unreadCount = unreadNotifications?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-br from-indigo-600 to-purple-700 transition-all transform ease-in-out duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="h-8 w-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="ml-2 text-xl font-bold text-white">AfriHR</span>
              </div>
              <nav className="mt-8 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                        item.current 
                          ? 'bg-indigo-800 text-white' 
                          : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {IconComponent && <IconComponent className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-indigo-200 group-hover:text-white'}`} />}
                      {item.name}
                      {item.name === 'Notifications' && unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-red-500 text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <button 
                className="flex-shrink-0 group block w-full text-left"
                onClick={handleLogout}
              >
                <div className="flex items-center">
                  <div className="inline-block h-10 w-10 rounded-full bg-indigo-900 overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-full w-full p-1 text-indigo-200" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-white">{user?.name || user?.fullName || 'User Name'}</p>
                    <div className="flex items-center text-sm font-medium text-indigo-200 group-hover:text-white transition-colors duration-150">
                      <LogOut className="mr-1 h-4 w-4" />
                      Sign out
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
        </div>
      </div>

      {/* Sidebar for desktop - FIXED: Removed translation transformation and made it properly hide/show */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:w-64' : 'md:w-20'}`}>
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="h-8 w-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              {sidebarOpen && (
                <>
                  <span className="ml-2 text-xl font-bold text-white">AfriHR</span>
                  {userRole && (
                    <span className="ml-2 text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded">
                      {userRole}
                    </span>
                  )}
                </>
              )}
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      item.current 
                        ? 'bg-indigo-800 text-white' 
                        : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                    }`}
                    title={!sidebarOpen ? item.name : ""}
                  >
                    {IconComponent && 
                      <IconComponent className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5 ${item.current ? 'text-white' : 'text-indigo-200 group-hover:text-white'}`} />
                    }
                    {sidebarOpen && (
                      <>
                        {item.name}
                        {item.name === 'Notifications' && unreadCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-red-500 text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </>
                    )}
                    {!sidebarOpen && item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <button 
              className="flex-shrink-0 group block w-full text-left"
              onClick={handleLogout}
            >
              <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
                <div className="inline-block h-10 w-10 rounded-full bg-indigo-900 overflow-hidden">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-full w-full p-1 text-indigo-200" />
                  )}
                </div>
                {sidebarOpen && (
                  <div className="ml-3">
                    <p className="text-base font-medium text-white">{user?.name || user?.fullName || 'User Name'}</p>
                    <div className="flex items-center text-sm font-medium text-indigo-200 group-hover:text-white transition-colors duration-150">
                      <LogOut className="mr-1 h-4 w-4" />
                      Sign out
                    </div>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content - FIXED: Dynamic padding based on sidebar state */}
      <div className={`flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
        {/* Top navigation bar */}
        <div className="sticky top-0 z-10 bg-white shadow">
          <div className="flex justify-between h-16 px-4 md:px-6">
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <button
                type="button"
                className="hidden md:inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 flex items-center">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="ml-2 text-sm text-gray-500">
                  {formatDate(currentDateTime)} | {formatTime(currentDateTime)}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              {/* Notifications */}
              <div className="relative ml-3">
                <button
                  type="button"
                  className="relative p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notification dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                      <div className="mt-2 divide-y divide-gray-100">
                        {unreadLoading ? (
                          <p className="text-sm text-gray-500 py-2">Loading notifications...</p>
                        ) : unreadNotifications && unreadNotifications.length > 0 ? (
                          unreadNotifications.slice(0, 5).map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} />
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 py-2">No new notifications</p>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <Link 
                          to="/dashboard/notifications" 
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white overflow-hidden">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user?.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <span className="hidden md:flex ml-2 text-sm font-medium text-gray-700">
                    {user?.name || user?.fullName || 'User Name'}
                  </span>
                  <ChevronDown className="hidden md:block ml-1 h-4 w-4 text-gray-500" />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-700">{user?.name || user?.fullName || 'User Name'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                        <p className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {userRole || user?.role || 'STAFF'}
                        </p>
                      </div>
                      <Link
                        to="/dashboard/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;