import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Shield, Heart, HelpCircle, BookOpen, FileText, User, LayoutDashboard, Settings } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Prepare', path: '/prepare', icon: Shield },
    { name: 'Someone Passed Away', path: '/loss', icon: Heart },
    { name: 'Emergency Help', path: '/emergency', icon: HelpCircle },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'My Documents', path: '/documents', icon: FileText },
    { name: 'Family Vault', path: '/vault', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-soft-sand dark:bg-navy/95 text-navy dark:text-soft-sand flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-navy border-b border-warm-slate/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-calamity rounded-lg flex items-center justify-center">
                  <Shield className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-navy dark:text-white">KinReady</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-warm-slate hover:text-calamity font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/account" className="p-2 rounded-full hover:bg-soft-sand dark:hover:bg-white/5 transition-colors">
                <User className="w-5 h-5 text-warm-slate" />
              </Link>
              <Link to="/settings" className="p-2 rounded-full hover:bg-soft-sand dark:hover:bg-white/5 transition-colors">
                <Settings className="w-5 h-5 text-warm-slate" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-warm-slate hover:bg-soft-sand dark:hover:bg-white/5 focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-navy border-b border-warm-slate/20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-warm-slate hover:bg-soft-sand dark:hover:bg-white/5 hover:text-calamity transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <hr className="my-2 border-warm-slate/20" />
              <Link
                to="/account"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-warm-slate hover:bg-soft-sand dark:hover:bg-white/5"
              >
                <User className="w-5 h-5" />
                <span>My Account</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-navy border-t border-warm-slate/20 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="text-calamity w-5 h-5" />
              <span className="font-bold text-lg tracking-tight text-navy dark:text-white">KinReady</span>
            </div>
            <p className="text-warm-slate text-sm">
              &copy; {new Date().getFullYear()} KinReady. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-warm-slate hover:text-calamity text-sm">Privacy</Link>
              <Link to="/terms" className="text-warm-slate hover:text-calamity text-sm">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
