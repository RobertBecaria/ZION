/**
 * ModuleNavigation Component
 * Top navigation bar with module selection buttons
 * Redesigned with Flowbite styling
 */
import React, { useState } from 'react';
import { User, Calendar, LogOut, Settings, ChevronDown } from 'lucide-react';
import { MODULES, MODULE_DEFAULT_VIEWS } from '../../config/moduleConfig';
import NotificationDropdown from '../NotificationDropdown';

const ModuleNavigation = ({
  activeModule,
  setActiveModule,
  setActiveView,
  moduleViewHistory = {},
  user,
  onLogout,
  currentTime,
  showCalendar,
  setShowCalendar,
  setShowOnboarding
}) => {
  const currentModule = MODULES.find(m => m.key === activeModule) || MODULES[0];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleModuleClick = (moduleKey) => {
    setActiveModule(moduleKey);
    // Use saved view from history, or fall back to default
    const savedView = moduleViewHistory[moduleKey];
    setActiveView(savedView || MODULE_DEFAULT_VIEWS[moduleKey] || 'wall');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      data-module={activeModule}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img
            src="/zion-logo.jpeg"
            alt="ZION.CITY Logo"
            className="h-10 w-10 rounded-lg object-cover shadow-sm"
          />
          <h1
            className="text-xl font-bold tracking-tight hidden sm:block"
            style={{ color: currentModule.color }}
          >
            ZION.CITY
          </h1>
        </div>

        {/* Module Navigation - Center */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {MODULES.map((module) => {
            const isActive = activeModule === module.key;
            return (
              <button
                key={module.key}
                onClick={() => handleModuleClick(module.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-all duration-200 ease-in-out
                  ${isActive
                    ? 'text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                style={{
                  backgroundColor: isActive ? module.color : undefined,
                  boxShadow: isActive ? `0 4px 14px ${module.color}40` : undefined
                }}
              >
                {module.name}
              </button>
            );
          })}
        </div>

        {/* Right Section - Clock, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Clock Widget */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            title="Открыть календарь"
          >
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {currentTime.toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="text-xs text-gray-500">
                {currentTime.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
            </div>
            <Calendar size={18} className="text-gray-400" />
          </button>

          {/* Notification Bell */}
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(!showNotifications)}
          />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-gray-600" />
                )}
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700">
                {user?.first_name}
              </span>
              <ChevronDown size={16} className="hidden lg:block text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowOnboarding(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    Настройки профиля
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Выйти
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ModuleNavigation;
