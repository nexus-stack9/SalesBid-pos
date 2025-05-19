
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import Header from './Header';
import { toast } from 'sonner';

const MainLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show a welcome toast when the app loads
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      toast.success(`Welcome back${userData.name ? ', ' + userData.name : ''}!`, {
        description: 'Your admin dashboard is ready',
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      <SideNav onLogout={handleLogout} />
      <div className="flex-1 ml-16 sm:ml-64">
        <Header onLogout={handleLogout} />
        <main className="p-4 md:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
