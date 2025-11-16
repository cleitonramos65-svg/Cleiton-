import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminReport } from './components/AdminReport';
import { UserManagement } from './components/UserManagement';
import type { User, FuelingRecord, NewUserData } from './types';
import { LogoutIcon, ReportIcon, UserPlusIcon } from './components/icons';

// In a real app, this would come from a secure backend.
const INITIAL_USERS: User[] = [
  { id: '1', name: 'João Silva', role: 'driver', password: '123', vehicle: 'Caminhão VW-123' },
  { id: '2', name: 'Maria Souza', role: 'driver', password: '123', vehicle: 'Scania R450' },
  { id: '3', name: 'Admin', role: 'admin', password: '123' },
  { id: '4', name: 'cgramos', role: 'admin', password: '123' },
];

type View = 'driver' | 'admin_report' | 'admin_users';
type NewRecordData = Omit<FuelingRecord, 'id' | 'driverId' | 'driverName' | 'vehicle' | 'recordTimestamp'>;

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fuelingRecords, setFuelingRecords] = useState<FuelingRecord[]>([]);
  const [view, setView] = useState<View>('driver');

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, options);
            }
        });
    }
  };

  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find(
      u => u.name.toLowerCase() === username.toLowerCase() && 
           u.password && u.password.toLowerCase() === password.toLowerCase()
    );
    if (user) {
        setCurrentUser(user);
        if (user.role === 'admin') {
          setView('admin_report');
        } else {
          setView('driver');
        }
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddUser = (data: NewUserData) => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        role: 'driver',
        password: data.password,
        vehicle: data.vehicle,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUserPassword = (userId: string, newPassword: string) => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.id === userId ? { ...user, password: newPassword } : user
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };
  
  const handleAddFueling = (data: NewRecordData) => {
      if (!currentUser || !currentUser.vehicle) return;

      const newRecord: FuelingRecord = {
          ...data,
          id: `record-${Date.now()}`,
          driverId: currentUser.id,
          driverName: currentUser.name,
          vehicle: currentUser.vehicle,
          recordTimestamp: new Date().toISOString()
      };

      setFuelingRecords(prev => [...prev, newRecord]);

      // Notify admin (simulated)
      if (Notification.permission === 'granted') {
        showNotification('Novo Registro Recebido', {
            body: `${currentUser.name} enviou um novo registro para ${data.vehiclePlate}.`,
        });
      }
  };
  
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const driverRecords = fuelingRecords.filter(r => r.driverId === currentUser.id);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
               <div className="text-xl font-bold text-white">Lusa Transportes</div>
            </div>
            <div className="flex items-center gap-4">
               {currentUser.role === 'admin' && (
                  <div className="flex gap-2 sm:gap-4">
                     <button onClick={() => setView('admin_report')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${view === 'admin_report' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                        <ReportIcon />
                        <span className="hidden sm:inline">Relatórios</span>
                    </button>
                     <button onClick={() => setView('admin_users')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${view === 'admin_users' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                        <UserPlusIcon />
                        <span className="hidden sm:inline">Motoristas</span>
                    </button>
                  </div>
                )}
                <span className="text-gray-300 hidden md:block">Logado como: {currentUser.name}</span>
                <button onClick={handleLogout} title="Sair" className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <LogoutIcon />
                </button>
            </div>
          </div>
        </nav>
      </header>
      <main>
          {currentUser.role === 'driver' && <DriverDashboard user={currentUser} records={driverRecords} onAddFueling={handleAddFueling} showNotification={showNotification} />}
          {currentUser.role === 'admin' && view === 'admin_report' && <AdminReport records={fuelingRecords} users={users} />}
          {currentUser.role === 'admin' && view === 'admin_users' && <UserManagement users={users} onAddUser={handleAddUser} onUpdateUserPassword={handleUpdateUserPassword} onDeleteUser={handleDeleteUser} />}
      </main>
    </div>
  );
};

export default App;