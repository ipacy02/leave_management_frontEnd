import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyTeam, selectUsers } from '../../redux/features/usersSlice';
import { toast } from 'react-hot-toast';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Button,
  Avatar,
  Spinner,
  Badge
} from '../common/uicomponent';

const ManagerTeamView = () => {
  const dispatch = useDispatch();
  const { loading, error, myTeam } = useSelector(selectUsers);

  useEffect(() => {
    dispatch(getMyTeam());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#fff',
          color: '#ef4444',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        icon: '❌',
      });
    }
  }, [error]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshTeam = () => {
    dispatch(getMyTeam());
    toast.success('Team list refreshed!', {
      duration: 4000,
      position: 'top-center',
      style: {
        background: 'linear-gradient(to right, #4f46e5, #7e22ce)',
        color: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      icon: '🔄',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Team</h1>
        <Button 
          onClick={refreshTeam}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white"
        >
          Refresh Team List
        </Button>
      </div>

      {!myTeam || myTeam.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No team members found.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTeam.map((user) => (
            <Card key={user.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b p-4">
                <div className="flex items-center space-x-4">
                  <Avatar 
                    src={user.profilePicUrl || '/default-avatar.png'} 
                    alt={user.fullName}
                    className="h-12 w-12 rounded-full border-2 border-white"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{user.fullName}</h3>
                    <Badge className={`mt-1 ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                  {user.departmentName && (
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-600">{user.departmentName}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 p-4 border-t">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                    onClick={() => window.location.href = `/users/${user.id}`}
                  >
                    View Profile
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerTeamView;