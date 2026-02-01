/**
 * RightSidebar / WorldZone Component
 * Right sidebar with context-specific widgets and filters
 * Redesigned with Flowbite styling
 */
import React from 'react';
import { Eye, Globe } from 'lucide-react';
import { getModuleByKey } from '../../config/moduleConfig';

// World Zone Components
import JournalWorldZone from '../JournalWorldZone';
import NewsWorldZone from '../NewsWorldZone';
import FamilyWorldZone from '../FamilyWorldZone';
import MediaWorldZone from '../MediaWorldZone';
import FamilyProfileWorldZone from '../FamilyProfileWorldZone';
import ChatWorldZone from '../ChatWorldZone';
import WorkWorldZone from '../WorkWorldZone';
import InfoWorldZone from '../InfoWorldZone';

// Work/Organization Widgets
import WorkNextEventWidget from '../WorkNextEventWidget';
import WorkUpcomingEventsList from '../WorkUpcomingEventsList';
import WorkCalendarWidget from '../WorkCalendarWidget';
import WorkDepartmentNavigator from '../WorkDepartmentNavigator';
import WorkAnnouncementsWidget from '../WorkAnnouncementsWidget';

const RightSidebar = ({
  // Core state
  activeModule,
  activeView,
  user,
  currentModule,
  sidebarTintStyle,

  // Family module
  activeFilters,
  setActiveFilters,
  userFamily,
  setActiveView,

  // Journal module
  schoolRoles,
  journalSchoolFilter,
  setJournalSchoolFilter,
  journalAudienceFilter,
  setJournalAudienceFilter,
  selectedSchool,
  setSelectedSchool,
  schoolRole,

  // Organizations module
  selectedOrganizationId,
  setSelectedOrganizationId,
  activeDepartmentId,
  setActiveDepartmentId,
  setShowDepartmentManager,
  departmentRefreshTrigger,
  myOrganizations,

  // Media module
  mediaStats,
  selectedModuleFilter,
  setSelectedModuleFilter,

  // Chat
  chatGroups,
  activeGroup,
  handleGroupSelect,
  handleCreateGroup,
  activeDirectChat,
  setActiveDirectChat,
  fetchChatGroups
}) => {
  // Use provided currentModule or get it from activeModule
  const moduleData = currentModule || getModuleByKey(activeModule);
  const moduleColor = moduleData?.color || '#6B7280';

  return (
    <aside
      className="right-sidebar w-80 h-[calc(100vh-64px)] fixed right-0 top-16 overflow-y-auto"
      style={{
        '--module-color': moduleColor,
        '--module-tint': `${moduleColor}14`,
        background: `linear-gradient(180deg, ${moduleColor}12 0%, rgba(255,255,255,0.85) 100%)`,
        borderLeft: '1px solid rgba(0,0,0,0.06)'
      }}
    >
      {/* Hide header for Chat view - it has its own */}
      {activeView !== 'chat' && (
        <div
          className="sticky top-0 px-4 py-3 z-10 backdrop-blur-md"
          style={{
            background: `linear-gradient(180deg, ${moduleColor}08 0%, rgba(255,255,255,0.9) 100%)`,
            borderBottom: '1px solid rgba(0,0,0,0.04)'
          }}
        >
          <div className="flex items-center gap-2">
            <Globe size={18} style={{ color: moduleColor }} />
            <h3 className="font-semibold text-gray-900">Мировая Зона</h3>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* JOURNAL Module - Feed View Filters */}
        {activeModule === 'journal' && (activeView === 'wall' || activeView === 'feed') && (
          <JournalWorldZone
            inFeedView={true}
            schoolRoles={schoolRoles}
            schoolFilter={journalSchoolFilter}
            onSchoolFilterChange={setJournalSchoolFilter}
            audienceFilter={journalAudienceFilter}
            onAudienceFilterChange={setJournalAudienceFilter}
            onOpenEventPlanner={() => setActiveView('event-planner')}
          />
        )}

        {/* JOURNAL Module - School Selected Navigation */}
        {activeModule === 'journal' && selectedSchool && (
          <JournalWorldZone
            selectedSchool={selectedSchool}
            role={schoolRole}
            onNavigate={(view) => {
              if (view === 'school-list') {
                setSelectedSchool(null);
                setActiveView('journal-school-tiles');
              } else {
                setActiveView(`journal-${view}`);
              }
            }}
          />
        )}

        {/* FAMILY Module - Feed View */}
        {activeModule === 'family' && (activeView === 'wall' || activeView === 'feed') && (
          <FamilyWorldZone
            moduleColor={moduleColor}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            user={user}
          />
        )}

        {/* NEWS Module - Social World Zone */}
        {activeModule === 'news' && (
          <NewsWorldZone
            user={user}
            moduleColor={moduleColor}
            onViewFriends={() => setActiveView('friends')}
            onViewFollowers={() => setActiveView('followers')}
            onViewFollowing={() => setActiveView('following')}
            onViewPeopleDiscovery={() => setActiveView('people-discovery')}
          />
        )}

        {/* Public View Button - Family Profile */}
        {activeModule === 'family' && userFamily && activeView === 'my-family-profile' && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={16} style={{ color: moduleColor }} />
              <span className="font-semibold text-gray-900 text-sm">Публичный просмотр</span>
            </div>
            <button
              onClick={() => setActiveView('family-public-view')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-2"
              style={{
                backgroundColor: activeView === 'family-public-view' ? moduleColor : 'white',
                color: activeView === 'family-public-view' ? 'white' : moduleColor,
                borderColor: moduleColor
              }}
            >
              <Eye size={16} />
              Как видят другие
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Посмотрите, как ваша семья отображается для других
            </p>
          </div>
        )}

        {/* ORGANIZATIONS Module - Widgets */}
        {activeModule === 'organizations' && selectedOrganizationId && activeView === 'work-org-profile' && (
          <div className="space-y-4">
            <WorkNextEventWidget organizationId={selectedOrganizationId} />
            <WorkUpcomingEventsList organizationId={selectedOrganizationId} maxEvents={5} />
            <WorkCalendarWidget organizationId={selectedOrganizationId} />
            <WorkDepartmentNavigator
              organizationId={selectedOrganizationId}
              activeDepartmentId={activeDepartmentId}
              onDepartmentSelect={setActiveDepartmentId}
              onCreateDepartment={() => setShowDepartmentManager(true)}
              moduleColor={moduleColor}
              refreshTrigger={departmentRefreshTrigger}
            />
            <WorkAnnouncementsWidget
              organizationId={selectedOrganizationId}
              departmentId={activeDepartmentId}
              onViewAll={() => setActiveView('work-announcements')}
              moduleColor={moduleColor}
            />
          </div>
        )}

        {/* MEDIA Views */}
        {(activeView === 'media-photos' || activeView === 'media-documents' || activeView === 'media-videos') && (
          <MediaWorldZone
            activeView={activeView}
            moduleColor={moduleColor}
            mediaStats={mediaStats}
            selectedModuleFilter={selectedModuleFilter}
            setSelectedModuleFilter={setSelectedModuleFilter}
          />
        )}

        {/* FAMILY PROFILE Views */}
        {(activeView === 'family-profiles' || activeView === 'family-create' || activeView === 'family-view' || activeView === 'family-invitations') && (
          <FamilyProfileWorldZone
            moduleColor={moduleColor}
            setActiveView={setActiveView}
          />
        )}

        {/* CHAT View */}
        {activeView === 'chat' && (
          <ChatWorldZone
            moduleColor={moduleColor}
            chatGroups={chatGroups}
            activeGroup={activeGroup}
            handleGroupSelect={handleGroupSelect}
            handleCreateGroup={handleCreateGroup}
            user={user}
            activeDirectChat={activeDirectChat}
            setActiveDirectChat={setActiveDirectChat}
            onRefreshGroups={fetchChatGroups}
          />
        )}

        {/* ORGANIZATIONS Module - Work WorldZone */}
        {activeModule === 'organizations' && (
          <WorkWorldZone
            organizations={myOrganizations}
            selectedOrg={selectedOrganizationId}
            onOrgChange={setSelectedOrganizationId}
            moduleColor={moduleColor}
          />
        )}

        {/* MY DOCUMENTS & MY INFO Views */}
        {(activeView === 'my-documents' || activeView === 'my-info') && (
          <InfoWorldZone activeView={activeView} />
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
