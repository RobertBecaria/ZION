/**
 * ModuleNavigation Component
 * Top navigation bar with module selection buttons
 * Redesigned with Flowbite styling + Framer Motion animations (2025 design)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="fixed top-0 left-0 right-0 z-50 border-b shadow-lg transition-all duration-500 ease-in-out"
      data-module={activeModule}
      style={{
        background: `linear-gradient(135deg, ${currentModule.color}15 0%, ${currentModule.color}08 50%, ${currentModule.color}15 100%)`,
        borderColor: `${currentModule.color}30`,
        boxShadow: `0 4px 20px ${currentModule.color}20, inset 0 -1px 0 ${currentModule.color}15`
      }}
    >
      {/* Animated gradient accent line at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, ${currentModule.color}60, ${currentModule.color}, ${currentModule.color}60)`
        }}
      />
      
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <img
            src="/zion-logo.jpeg"
            alt="ZION.CITY Logo"
            className="h-10 w-10 rounded-full object-cover shadow-lg ring-2 ring-white transition-all duration-300"
            style={{
              boxShadow: `0 4px 14px ${currentModule.color}50, 0 0 20px ${currentModule.color}30`
            }}
          />
          <h1
            className="text-xl font-bold tracking-tight hidden sm:block transition-colors duration-300"
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
              <motion.button
                key={module.key}
                onClick={() => handleModuleClick(module.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  relative overflow-hidden
                  ${isActive
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                style={{
                  backgroundColor: isActive ? module.color : 'transparent',
                  boxShadow: isActive 
                    ? `0 4px 20px ${module.color}50, 0 0 30px ${module.color}30, inset 0 1px 0 rgba(255,255,255,0.2)` 
                    : undefined
                }}
                whileHover={{ 
                  scale: isActive ? 1.02 : 1.05,
                  backgroundColor: isActive ? module.color : 'rgba(243, 244, 246, 1)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                layout
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.span
                    className="absolute -bottom-0.5 left-1/2 w-1.5 h-1.5 bg-white rounded-full"
                    layoutId="activeModuleDot"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ transform: 'translateX(-50%)' }}
                  />
                )}
                
                {/* Shimmer effect on active */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                )}
                
                <span className="relative z-10">{module.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Right Section - Clock, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Clock Widget */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300"
            style={{
              backgroundColor: `${currentModule.color}10`,
              borderColor: `${currentModule.color}25`,
              border: `1px solid ${currentModule.color}25`
            }}
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
            <Calendar size={18} style={{ color: currentModule.color }} />
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300"
              style={{
                backgroundColor: `${currentModule.color}10`,
              }}
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
