/**
 * LeftSidebar Component
 * Left sidebar with user profile and module-specific navigation
 * Redesigned with Flowbite styling
 */
import React from 'react';
import {
  User, Newspaper, Heart, Briefcase, GraduationCap,
  Users, MessageCircle, Image, Video, FileText, Settings, Tv,
  ShoppingCart, Package, Store, Smartphone, Shirt, Car, Home as HomeIcon, Laptop, Palette,
  Wallet, Send, TrendingUp, DollarSign, Coins, Bot, Search, Calendar, ChevronRight
} from 'lucide-react';
import { getModuleByKey } from '../../config/moduleConfig';

const LeftSidebar = ({
  activeModule,
  activeView,
  setActiveView,
  user,
  // Module-specific props
  schoolRoles,
  loadingSchoolRoles,
  schoolRole,
  setSchoolRole,
  setSelectedSchool,
  setSelectedChannelId
}) => {
  const currentModule = getModuleByKey(activeModule);
  const moduleColor = currentModule.color;

  // Navigation button component
  const NavButton = ({ icon: Icon, label, viewKey, color = moduleColor, onClick }) => {
    const isActive = activeView === viewKey || (Array.isArray(viewKey) && viewKey.includes(activeView));
    const handleClick = onClick || (() => setActiveView(Array.isArray(viewKey) ? viewKey[0] : viewKey));

    return (
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200
          ${isActive
            ? 'text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        style={{
          backgroundColor: isActive ? color : undefined,
          boxShadow: isActive ? `0 2px 8px ${color}40` : undefined
        }}
      >
        <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
        <span className="flex-1 text-left">{label}</span>
        {isActive && <ChevronRight size={16} className="text-white/70" />}
      </button>
    );
  };

  // Section divider component
  const Divider = () => (
    <div className="h-px bg-gray-200 my-3 mx-2" />
  );

  // Section label component
  const SectionLabel = ({ children, color = moduleColor }) => (
    <div
      className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
      style={{ color }}
    >
      {children}
    </div>
  );

  return (
    <aside
      className="left-sidebar w-72 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto"
      style={{
        '--module-color': moduleColor,
        '--module-tint': `${moduleColor}14`,
        background: `linear-gradient(180deg, ${moduleColor}12 0%, rgba(255,255,255,0.85) 100%)`,
        borderRight: '1px solid rgba(0,0,0,0.06)'
      }}
    >
      <div className="p-4">
        {/* User Profile Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-lg"
                style={{ backgroundColor: `${moduleColor}20` }}
              >
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: moduleColor }}
                  >
                    <User size={36} className="text-white" strokeWidth={2} />
                  </div>
                )}
              </div>
              <div
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500"
                title="Онлайн"
              />
            </div>
            <h3 className="mt-3 font-semibold text-gray-900 text-center">
              {user?.name_alias || `${user?.first_name} ${user?.last_name}`}
            </h3>
            <p className="text-sm text-gray-500">
              @{user?.email?.split('@')[0]}
            </p>
          </div>

          {/* Profile Button */}
          <NavButton
            icon={User}
            label="Мой Профиль"
            viewKey="my-profile"
          />
        </div>

        {/* Module-specific Navigation */}
        <div className="space-y-1">
          {/* Generic Feed Button - For modules without dedicated feed */}
          {activeModule !== 'organizations' && activeModule !== 'journal' && activeModule !== 'news' && (
            <NavButton
              icon={Newspaper}
              label="Моя Лента"
              viewKey="feed"
            />
          )}

          {/* ==================== FAMILY MODULE ==================== */}
          {activeModule === 'family' && (
            <>
              <Divider />
              <NavButton
                icon={Heart}
                label="Моя Семья"
                viewKey="my-family-profile"
                color="#059669"
              />
            </>
          )}

          {/* ==================== ORGANIZATIONS MODULE ==================== */}
          {activeModule === 'organizations' && (
            <>
              <Divider />
              <NavButton
                icon={Newspaper}
                label="Моя Лента"
                viewKey={['wall', 'feed']}
                color="#C2410C"
              />
              <Divider />
              <NavButton
                icon={Briefcase}
                label="Моя Работа"
                viewKey="my-work"
                color="#C2410C"
              />
              <NavButton
                icon={GraduationCap}
                label="Моя Школа"
                viewKey="my-school-admin"
                color="#1E40AF"
              />
            </>
          )}

          {/* ==================== JOURNAL MODULE ==================== */}
          {activeModule === 'journal' && !loadingSchoolRoles && schoolRoles && (
            <>
              <Divider />
              <NavButton
                icon={Newspaper}
                label="Моя Лента"
                viewKey={['wall', 'feed']}
                color="#6D28D9"
              />
              <Divider />
              {schoolRoles.is_parent && (
                <NavButton
                  icon={GraduationCap}
                  label="Моя Школа"
                  viewKey="journal-school-tiles"
                  color="#6D28D9"
                  onClick={() => {
                    setSchoolRole('parent');
                    setSelectedSchool(null);
                    setActiveView('journal-school-tiles');
                  }}
                />
              )}
              {schoolRoles.is_teacher && (
                <NavButton
                  icon={Briefcase}
                  label="Моя Работа"
                  viewKey="journal-school-tiles"
                  color="#6D28D9"
                  onClick={() => {
                    setSchoolRole('teacher');
                    setSelectedSchool(null);
                    setActiveView('journal-school-tiles');
                  }}
                />
              )}
            </>
          )}

          {/* ==================== NEWS MODULE ==================== */}
          {activeModule === 'news' && (
            <>
              <Divider />
              <NavButton
                icon={Newspaper}
                label="Моя Лента"
                viewKey={['wall', 'feed']}
                color="#1D4ED8"
                onClick={() => {
                  setActiveView('feed');
                  if (setSelectedChannelId) setSelectedChannelId(null);
                }}
              />
              <NavButton
                icon={Tv}
                label="Каналы"
                viewKey="channels"
                color="#1D4ED8"
                onClick={() => {
                  setActiveView('channels');
                  if (setSelectedChannelId) setSelectedChannelId(null);
                }}
              />
            </>
          )}

          {/* ==================== SERVICES MODULE ==================== */}
          {activeModule === 'services' && (
            <>
              <Divider />
              <NavButton icon={Search} label="Поиск" viewKey="services-search" color="#B91C1C" />
              <NavButton icon={Briefcase} label="Мой Профиль" viewKey="services-my-profile" color="#B91C1C" />
              <NavButton icon={Newspaper} label="Моя Лента" viewKey="services-feed" color="#B91C1C" />
              <NavButton icon={FileText} label="Мои Заявки" viewKey="services-bookings" color="#B91C1C" />
              <NavButton icon={Calendar} label="Календарь" viewKey="services-calendar" color="#B91C1C" />
            </>
          )}

          {/* ==================== MARKETPLACE MODULE ==================== */}
          {activeModule === 'marketplace' && (
            <>
              <Divider />
              <NavButton
                icon={Bot}
                label="ERIC AI"
                viewKey="eric-ai"
                color="#F59E0B"
              />
              <Divider />
              <NavButton
                icon={Store}
                label="Маркетплейс"
                viewKey="marketplace-search"
                color="#BE185D"
              />
              <Divider />
              <SectionLabel color="#BE185D">Мои Вещи</SectionLabel>
              <NavButton icon={Smartphone} label="Умные Вещи" viewKey="my-things-smart" color="#3B82F6" />
              <NavButton icon={Shirt} label="Мой Гардероб" viewKey="my-things-wardrobe" color="#EC4899" />
              <NavButton icon={Car} label="Мой Гараж" viewKey="my-things-garage" color="#F59E0B" />
              <NavButton icon={HomeIcon} label="Мой Дом" viewKey="my-things-home" color="#10B981" />
              <NavButton icon={Laptop} label="Моя Электроника" viewKey="my-things-electronics" color="#8B5CF6" />
              <NavButton icon={Palette} label="Моя Коллекция" viewKey="my-things-collection" color="#F97316" />
              <Divider />
              <NavButton icon={Package} label="Мои Объявления" viewKey="marketplace-my-listings" color="#BE185D" />
              <NavButton icon={Heart} label="Избранное" viewKey="marketplace-favorites" color="#BE185D" />
            </>
          )}

          {/* ==================== FINANCE MODULE ==================== */}
          {activeModule === 'finance' && (
            <>
              <Divider />
              <NavButton
                icon={Wallet}
                label="Мой Кошелёк"
                viewKey={['wallet', 'wall', 'feed']}
                color="#A16207"
              />
              <Divider />
              <SectionLabel color="#A16207">Быстрые Действия</SectionLabel>
              <NavButton icon={Coins} label="Отправить COIN" viewKey="wallet" color="#059669" />
              <NavButton icon={TrendingUp} label="Передать TOKEN" viewKey="wallet" color="#8B5CF6" />
              <Divider />
              <SectionLabel color="#A16207">Информация</SectionLabel>
              <NavButton icon={DollarSign} label="Курсы валют" viewKey="wallet" color="#A16207" />
            </>
          )}

          {/* ==================== EVENTS MODULE ==================== */}
          {activeModule === 'events' && (
            <>
              <Divider />
              <NavButton icon={Search} label="Поиск Мероприятий" viewKey="goodwill-search" color="#8B5CF6" />
              <NavButton icon={Calendar} label="Календарь" viewKey="goodwill-calendar" color="#8B5CF6" />
              <Divider />
              <SectionLabel color="#8B5CF6">Моя Активность</SectionLabel>
              <NavButton icon={Heart} label="Мои мероприятия" viewKey="goodwill-my-events" color="#8B5CF6" />
              <NavButton icon={Send} label="Приглашения" viewKey="goodwill-invitations" color="#8B5CF6" />
              <NavButton icon={Users} label="Группы по интересам" viewKey="goodwill-groups" color="#8B5CF6" />
              <Divider />
              <SectionLabel color="#8B5CF6">Организатор</SectionLabel>
              <NavButton icon={User} label="Профиль организатора" viewKey="goodwill-organizer-profile" color="#8B5CF6" />
              <NavButton icon={Heart} label="Создать мероприятие" viewKey="goodwill-create-event" color="#8B5CF6" />
            </>
          )}

          {/* ==================== COMMON SECTIONS ==================== */}
          <Divider />

          {/* Friends - Hidden in News module */}
          {activeModule !== 'news' && (
            <NavButton icon={Users} label="Мои Друзья" viewKey="friends" />
          )}
          <NavButton icon={MessageCircle} label="Мои Сообщения" viewKey="chat" />

          <Divider />
          <SectionLabel>Медиа Хранилище</SectionLabel>
          <NavButton icon={Image} label="Мои Фото" viewKey="media-photos" />
          <NavButton icon={FileText} label="Мои Документы" viewKey="media-documents" />
          <NavButton icon={Video} label="Мои Видео" viewKey="media-videos" />

          <Divider />
          <SectionLabel>Моя Информация</SectionLabel>
          <NavButton icon={User} label="Профиль" viewKey="my-info" />
          <NavButton icon={FileText} label="Документы" viewKey="my-documents" />

          <Divider />
          <NavButton icon={Settings} label="Настройки" viewKey="settings" />
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
