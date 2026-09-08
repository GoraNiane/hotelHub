import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, LogOut, User as UserIcon, Calendar, Hotel, LayoutDashboard, 
  CalendarRange, Users, DoorOpen, CheckSquare, BarChart3, Percent, 
  Sparkles, Star, CreditCard, UserCheck, Bell 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) return null;

  const role = currentUser.role;

  // Define sidebar links based on user roles
  const getSidebarLinks = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
          { name: 'Gérer Chambres', path: '/admin/rooms', icon: DoorOpen },
          { name: 'Réservations', path: '/admin/reservations', icon: CalendarRange },
          { name: 'Clients', path: '/admin/clients', icon: Users },
          { name: 'Gestion Rôles / Équipe', path: '/admin/employees', icon: UserCheck },
          { name: 'Services', path: '/admin/services', icon: Sparkles },
          { name: 'Promotions', path: '/admin/promotions', icon: Percent },
          { name: 'Paiements', path: '/admin/payments', icon: CreditCard },
          { name: 'Avis Clients', path: '/admin/reviews', icon: Star },
        ];
      case 'RECEPTIONIST':
        return [
          { name: 'Dashboard', path: '/reception/dashboard', icon: LayoutDashboard },
          { name: 'Réservations', path: '/reception/reservations', icon: CalendarRange },
          { name: 'Calendrier Planning', path: '/reception/calendar', icon: Calendar },
          { name: 'Clients', path: '/reception/clients', icon: Users },
          { name: 'Statut Chambres', path: '/reception/rooms', icon: DoorOpen },
          { name: 'Check-in', path: '/reception/checkin', icon: CheckSquare },
          { name: 'Check-out', path: '/reception/checkout', icon: LogOut },
        ];
      case 'CLIENT':
      default:
        return [
          { name: 'Mon Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
          { name: 'Mes Réservations', path: '/client/reservations', icon: CalendarRange },
          { name: 'Mon Profil', path: '/client/profile', icon: UserIcon },
        ];
    }
  };

  const links = getSidebarLinks();
  const isActive = (path: string) => location.pathname === path;

  const getPortalName = () => {
    if (role === 'ADMIN') return 'Portail Administrateur';
    if (role === 'RECEPTIONIST') return 'Portail Réception';
    return 'Espace Client';
  };

  return (
    <div className="flex h-screen bg-teranga-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-teranga-green-800 text-white shrink-0 shadow-lg border-r border-teranga-green-900">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 h-20 px-6 border-b border-teranga-green-750">
          <div className="w-9 h-9 bg-teranga-gold-450 rounded-full flex items-center justify-center shadow-md">
            <Hotel className="w-5 h-5 text-teranga-green-800" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm tracking-wider font-semibold text-teranga-gold-100">TERANGA PALACE</span>
            <span className="text-[9px] tracking-widest uppercase text-teranga-gold-450 font-medium">Hotel Dakar</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-teranga-beige-400 font-semibold opacity-75">
            {getPortalName()}
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-teranga-gold-450 text-teranga-green-800 shadow-md font-semibold'
                    : 'text-teranga-beige-200 hover:bg-teranga-green-750 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-teranga-green-800' : 'text-teranga-gold-450'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Bottom Footer */}
        <div className="p-4 border-t border-teranga-green-750 bg-teranga-green-850">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-teranga-gold-450 flex items-center justify-center font-bold text-teranga-green-800 text-xs">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-teranga-beige-100 truncate">{currentUser.firstName} {currentUser.lastName}</span>
              <span className="text-[10px] text-teranga-beige-300/60 truncate capitalize">{role.toLowerCase()}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 rounded-md transition-colors text-left"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative flex flex-col w-64 bg-teranga-green-800 text-white shadow-2xl animate-fade-in">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-teranga-beige-200 hover:text-white focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 h-20 px-6 border-b border-teranga-green-750">
              <div className="w-9 h-9 bg-teranga-gold-450 rounded-full flex items-center justify-center">
                <Hotel className="w-5 h-5 text-teranga-green-800" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-sm tracking-wider font-semibold text-teranga-gold-100">TERANGA PALACE</span>
                <span className="text-[9px] tracking-widest uppercase text-teranga-gold-450 font-medium">Hotel Dakar</span>
              </div>
            </div>

            <nav className="flex-grow py-6 px-4 space-y-1.5 overflow-y-auto">
              <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-teranga-beige-400 font-semibold opacity-75">
                {getPortalName()}
              </div>
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-teranga-gold-450 text-teranga-green-800 font-semibold shadow-md'
                        : 'text-teranga-beige-200 hover:bg-teranga-green-750 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-teranga-green-800' : 'text-teranga-gold-450'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-teranga-green-750 bg-teranga-green-850">
              <div className="flex items-center gap-3 px-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-teranga-gold-450 flex items-center justify-center font-bold text-teranga-green-800 text-xs">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-teranga-beige-100">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="text-[10px] text-teranga-beige-300/60 capitalize">{role.toLowerCase()}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 rounded-md text-left"
              >
                <LogOut className="w-4 h-4 shrink-0 text-red-400" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-teranga-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-teranga-gray-500 hover:text-teranga-gray-700 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="font-serif text-lg md:text-xl font-semibold text-teranga-green-800">
              Bienvenue, {currentUser.firstName} !
            </h1>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Direct Home site Link */}
            <Link
              to="/"
              className="hidden md:flex text-xs font-medium text-teranga-gold-600 hover:text-teranga-gold-700 bg-teranga-gold-50 border border-teranga-gold-200 py-1.5 px-3 rounded-md transition-colors"
            >
              Voir le Site Public
            </Link>

            {/* Notifications mock bell */}
            <div className="relative p-1.5 hover:bg-teranga-gray-100 rounded-full cursor-pointer text-teranga-gray-500 hover:text-teranga-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teranga-gold-450 rounded-full ring-2 ring-white"></span>
            </div>

            <div className="w-px h-6 bg-teranga-gray-200"></div>

            {/* Topbar User profile name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teranga-green-750 text-white flex items-center justify-center font-semibold text-xs shadow-inner">
                {currentUser.firstName[0]}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-teranga-gray-650">
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </div>

          </div>
        </header>

        {/* Dashboard Dynamic Page Area */}
        <main className="flex-1 overflow-y-auto bg-teranga-beige-100 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};
