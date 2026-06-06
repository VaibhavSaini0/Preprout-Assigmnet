import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Logo,
  IconDashboard,
  IconTestCreation,
  IconTestTracking,
  IconGrid,
  IconUsers,
  IconBuilding,
  IconSettings,
  IconHelp,
  IconDoubleChevronRight,
} from '../icons/Icons';

const iconNavItems = [
  { icon: <IconDashboard />, label: 'Dashboard', to: '/dashboard' },
  { icon: <IconTestCreation />, label: 'Test Creation', to: '/create-test' },
  { icon: <IconTestTracking />, label: 'Test Tracking', to: '/dashboard' },
  { icon: <IconGrid />, label: 'Resources' },
  { icon: <IconUsers />, label: 'User Management' },
  { icon: <IconBuilding />, label: 'Admin Management' },
  { icon: <IconUsers />, label: 'Role Management' },
  { icon: <IconGrid />, label: 'Subscriptions' },
  { icon: <IconGrid />, label: 'Payments' },
];

interface SidebarProps {
  activeNav?: string;
  showQuestionPanel?: boolean;
  questionPanel?: React.ReactNode;
}

export default function Sidebar({ activeNav = 'Test Creation', showQuestionPanel, questionPanel }: SidebarProps) {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  if (showQuestionPanel) {
    const renderedPanel = React.isValidElement(questionPanel)
      ? React.cloneElement(questionPanel as React.ReactElement<any>, {
          onCollapse: () => setIsPanelCollapsed(true)
        })
      : questionPanel;

    return (
      <aside className="flex h-full shrink-0 bg-bg-card relative">
        {/* Icon Strip */}
        <div className="w-sidebar-icon bg-bg-card border-r border-border flex flex-col items-center py-xl h-full max-md:w-[56px] max-md:py-md">
          <nav className="flex flex-col gap-sm w-full px-md">
            {iconNavItems.map((item) => {
              const baseItemClass = "flex items-center justify-center w-11 h-11 mx-auto rounded-md text-text-subtle transition-colors duration-150 hover:bg-bg-tab-active hover:text-primary max-md:w-10 max-md:h-10";
              const activeClass = "bg-bg-tab-active text-primary";
              
              return item.to ? (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `${baseItemClass} ${isActive || item.label === activeNav ? activeClass : ''}`
                  }
                  title={item.label}
                >
                  {item.icon}
                </NavLink>
              ) : (
                <button
                  key={item.label}
                  className={baseItemClass}
                  title={item.label}
                  type="button"
                >
                  {item.icon}
                </button>
              );
            })}
          </nav>
          
          <div className="mt-auto flex flex-col gap-sm w-full px-md">
            <button
              className="flex items-center justify-center w-11 h-11 mx-auto rounded-md text-text-subtle transition-colors duration-150 hover:bg-bg-tab-active hover:text-primary max-md:w-10 max-md:h-10"
              type="button"
              title="Help"
            >
              <IconHelp />
            </button>
            <button
              className="flex items-center justify-center w-11 h-11 mx-auto rounded-md text-text-subtle transition-colors duration-150 hover:bg-bg-tab-active hover:text-primary max-md:w-10 max-md:h-10"
              type="button"
              title="Settings"
            >
              <IconSettings />
            </button>
          </div>
        </div>

        {/* Question Panel */}
        {renderedPanel && (
          <div
            className={`w-sidebar-nav bg-[#f3f4f6] border-r border-border p-lg overflow-y-auto max-xl:w-[200px] max-md:w-[min(280px,calc(100vw-56px))] transition-all duration-200 ${
              isPanelCollapsed ? '!w-0 !p-0 !border-none !overflow-hidden' : ''
            }`}
          >
            {renderedPanel}
          </div>
        )}

        {/* Expand Handle */}
        {isPanelCollapsed && (
          <button
            type="button"
            className="absolute left-sidebar-icon max-md:left-[56px] top-24 w-6 h-12 bg-bg-card border border-border border-l-0 rounded-r-md flex items-center justify-center text-text-subtle shadow-sm z-10 cursor-pointer transition-colors duration-200 hover:text-primary hover:bg-bg-tab-active"
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
    <aside className="flex h-full shrink-0 bg-bg-card relative w-sidebar-nav border-r border-border max-lg:w-sidebar-icon max-md:w-[56px]">
      {/* Expanded Nav Panel */}
      <div className="w-full bg-bg-card py-2xl flex flex-col h-full max-lg:hidden">
        <div className="mb-3xl px-2xl shrink-0">
          <Logo className="w-[140px] h-auto" />
        </div>
        <nav className="flex flex-col gap-xs overflow-y-auto flex-1">
          {iconNavItems.map((item) => {
            const baseItemClass = "relative flex items-center gap-md py-md px-2xl text-sm font-medium text-text-main no-underline transition-colors duration-150 hover:bg-bg-tab-active hover:no-underline";
            const activeClass = "bg-bg-tab-active text-primary font-semibold before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary";
            
            return item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `${baseItemClass} ${isActive || item.label === activeNav ? activeClass : ''}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <button
                key={item.label}
                type="button"
                className={baseItemClass}
                onClick={() => undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapsed Icon Strip for screens < 1200px (lg) */}
      <div className="hidden max-lg:flex w-sidebar-icon bg-bg-card flex-col items-center py-xl h-full max-md:w-[56px] max-md:py-md">
        <nav className="flex flex-col gap-sm w-full px-md">
          {iconNavItems.map((item) => {
            const baseItemClass = "flex items-center justify-center w-11 h-11 mx-auto rounded-md text-text-subtle transition-colors duration-150 hover:bg-bg-tab-active hover:text-primary max-md:w-10 max-md:h-10";
            const activeClass = "bg-bg-tab-active text-primary";
            
            return item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `${baseItemClass} ${isActive || item.label === activeNav ? activeClass : ''}`
                }
                title={item.label}
              >
                {item.icon}
              </NavLink>
            ) : (
              <button
                key={item.label}
                className={baseItemClass}
                title={item.label}
                type="button"
              >
                {item.icon}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto flex flex-col gap-sm w-full px-md">
          <button
            className="flex items-center justify-center w-11 h-11 mx-auto rounded-md text-text-subtle transition-colors duration-150 hover:bg-bg-tab-active hover:text-primary max-md:w-10 max-md:h-10"
            type="button"
            title="Help"
          >
            <IconHelp />
          </button>
          <button
            className="flex items-center justify-center w-11 h-11 mx-auto rounded-md text-text-subtle transition-colors duration-150 hover:bg-bg-tab-active hover:text-primary max-md:w-10 max-md:h-10"
            type="button"
            title="Settings"
          >
            <IconSettings />
          </button>
        </div>
      </div>
    </aside>
  );
}
