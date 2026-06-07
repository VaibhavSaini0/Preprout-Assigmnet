import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  IconDashboard,
  IconTestCreation,
  IconTestTracking,
  IconBook,
  IconUsers,
  IconBuilding,
  IconShield,
  IconLayers,
  IconCreditCard,
  IconHelp,
  IconSettings,
  IconDoubleChevronRight,
} from '../icons/Icons';
// Modal removed, redirecting to page instead

const RAIL_W = 72;
const NAV_W = 200;
const QUESTION_PANEL_W = 280;

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type NavLinkItem = {
  type: 'link';
  label: string;
  icon: IconComponent;
  to: string;
};

type NavSoonItem = {
  type: 'soon';
  label: string;
  icon: IconComponent;
};

type NavItem = NavLinkItem | NavSoonItem;

const mainNavItems: NavItem[] = [
  { type: 'link', icon: IconDashboard, label: 'Dashboard', to: '/dashboard' },
  { type: 'link', icon: IconTestCreation, label: 'Test Creation', to: '/create-test' },
  { type: 'link', icon: IconTestTracking, label: 'Test Tracking', to: '/tracking' },
  { type: 'link', icon: IconBook, label: 'Resources', to: '/resources' },
  { type: 'link', icon: IconUsers, label: 'User Management', to: '/user-management' },
  { type: 'link', icon: IconBuilding, label: 'Admin Management', to: '/admin-management' },
  { type: 'link', icon: IconShield, label: 'Role Management', to: '/role-management' },
  { type: 'link', icon: IconLayers, label: 'Subscriptions', to: '/subscriptions' },
  { type: 'link', icon: IconCreditCard, label: 'Payments', to: '/payments' },
];


const bottomNavItems: NavLinkItem[] = [
  { type: 'link', icon: IconHelp, label: 'Help & Support', to: '/help-support' },
  { type: 'link', icon: IconSettings, label: 'Settings', to: '/settings' },
];

interface SidebarProps {
  showQuestionPanel?: boolean;
  questionPanel?: React.ReactNode;
}

function useNavActive() {
  const location = useLocation();

  return (to: string, label: string) => {
    const path = location.pathname;
    if (label === 'Test Creation') {
      return (
        path.startsWith('/create-test') ||
        path.startsWith('/edit-test') ||
        path.startsWith('/test-view') ||
        path.startsWith('/confirmation')
      );
    }
    if (label === 'Test Tracking') {
      return path.startsWith('/tracking');
    }
    if (label === 'Dashboard') {
      return path === '/dashboard';
    }
    return path === to || path.startsWith(`${to}/`);
  };
}

function NavItemLink({
  icon: Icon,
  label,
  to,
  isActive,
  showLabel,
}: {
  icon: IconComponent;
  label: string;
  to: string;
  isActive: (to: string, label: string) => boolean;
  showLabel: boolean;
}) {
  const active = isActive(to, label);

  return (
    <NavLink
      to={to}
      title={!showLabel ? label : undefined}
      className={[
        'relative flex items-center rounded-lg text-sm font-medium no-underline transition-colors duration-150 h-11 w-full overflow-hidden',
        active
          ? 'bg-primary-light text-primary-dark font-semibold'
          : 'text-text-subtle hover:bg-bg-tab-active hover:text-primary hover:no-underline',
        active
          ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[4px] before:bg-primary'
          : '',
      ].join(' ')}
    >
      <span className="flex items-center justify-center w-11 h-11 shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      {showLabel && <span className="whitespace-nowrap pr-md truncate">{label}</span>}
    </NavLink>
  );
}


function SidebarNav({
  showLabel,
  compact = false,
}: {
  showLabel: boolean;
  compact?: boolean;
}) {
  const isActive = useNavActive();

  return (
    <>
      <nav className={`flex flex-col gap-xs flex-1 overflow-y-auto overflow-x-hidden ${compact ? 'p-sm pt-md' : 'p-md pt-lg'}`}>
        {mainNavItems.map((item) =>
          item.type === 'link' ? (
            <NavItemLink
              key={item.label}
              {...item}
              isActive={isActive}
              showLabel={showLabel}
            />
          ) : null,
        )}

      </nav>

      <div className={`shrink-0 flex flex-col gap-xs ${compact ? 'p-sm' : 'p-md'}`}>
        {bottomNavItems.map((item) => (
          <NavItemLink
            key={item.label}
            {...item}
            isActive={isActive}
            showLabel={showLabel}
          />
        ))}
      </div>
    </>
  );
}

function SidebarShell({
  showLabel,
  className = '',
  railMode = false,
}: {
  showLabel: boolean;
  className?: string;
  railMode?: boolean;
}) {
  return (
    <div className={`flex flex-col h-full bg-bg-card border-r border-border overflow-hidden ${className}`}>
      <SidebarNav showLabel={showLabel} compact={railMode} />
    </div>
  );
}

function FullNavSidebar() {
  return (
    <div className="hidden lg:flex shrink-0 h-full" style={{ width: NAV_W }}>
      <SidebarShell showLabel />
    </div>
  );
}

function HoverIconRail() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative shrink-0 h-full"
      style={{ width: RAIL_W }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute top-0 left-0 h-full transition-[width,box-shadow] duration-200 ease-out"
        style={{
          width: hovered ? NAV_W : RAIL_W,
          boxShadow: hovered ? '4px 0 20px rgba(15, 23, 42, 0.1)' : undefined,
          zIndex: 50,
        }}
      >
        <SidebarShell showLabel={hovered} railMode />
      </div>
    </div>
  );
}

function MobileIconRail() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative shrink-0 h-full flex lg:hidden"
      style={{ width: RAIL_W }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute top-0 left-0 h-full transition-[width,box-shadow] duration-200 ease-out"
        style={{
          width: hovered ? NAV_W : RAIL_W,
          boxShadow: hovered ? '4px 0 20px rgba(15, 23, 42, 0.1)' : undefined,
          zIndex: 50,
        }}
      >
        <SidebarShell showLabel={hovered} railMode />
      </div>
    </div>
  );
}

export default function Sidebar({ showQuestionPanel, questionPanel }: SidebarProps) {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const questionPanelContent = showQuestionPanel
    ? React.isValidElement(questionPanel)
      ? React.cloneElement(questionPanel as React.ReactElement<{ onCollapse?: () => void }>, {
        onCollapse: () => setIsPanelCollapsed(true),
      })
      : questionPanel
    : null;

  if (showQuestionPanel) {
    return (
      <aside className="relative flex h-full shrink-0 z-40">
        <HoverIconRail />

        {!isPanelCollapsed && questionPanelContent && (
          <div
            className="flex flex-col h-full overflow-y-auto overflow-x-hidden bg-bg-card border-r border-border shrink-0"
            style={{ width: QUESTION_PANEL_W }}
          >
            <div className="p-lg min-w-0 flex-1">{questionPanelContent}</div>
          </div>
        )}

        {isPanelCollapsed && (
          <button
            type="button"
            className="absolute left-[72px] top-lg w-7 h-14 bg-bg-card border border-border border-l-0 rounded-r-lg flex items-center justify-center text-text-subtle shadow-md z-30 hover:text-primary hover:bg-primary-light transition-colors"
            onClick={() => setIsPanelCollapsed(false)}
            title="Expand Question Panel"
            aria-label="Expand question panel"
          >
            <IconDoubleChevronRight />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside className="relative flex h-full shrink-0 z-40">
      <FullNavSidebar />
      <MobileIconRail />
    </aside>
  );
}
