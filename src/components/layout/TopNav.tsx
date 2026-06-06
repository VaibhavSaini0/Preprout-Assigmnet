import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestContext } from '../../context/TestContext';
import { IconBell, IconChevronDown } from '../icons/Icons';

export default function TopNav() {
  const { user, logout } = useTestContext();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const name = user?.name || user?.userId || 'Admin User';
  const role = user?.role || 'Admin';

  return (
    <header className="flex items-center justify-end h-topnav px-2xl bg-bg-card border-b border-border shrink-0 max-sm:px-lg">
      <div className="flex-1" />
      <div className="flex items-center gap-lg">
        <button
          className="relative flex items-center justify-center w-11 h-11 rounded-full border border-border text-text-main bg-bg-card"
          type="button"
          aria-label="Notifications"
        >
          <IconBell />
          <span className="absolute top-[10px] right-[12px] w-2 h-2 bg-success rounded-full border-2 border-white" />
        </button>
        
        <div className="relative" ref={wrapperRef}>
          <button
            className="flex items-center gap-md p-sm px-md rounded-lg bg-transparent text-text-main hover:bg-bg-tab-active transition duration-150"
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-expanded={dropdownOpen}
            aria-label="User profile menu"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5988ef&color=fff&size=96`}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col items-start text-left max-sm:hidden">
              <span className="text-base font-semibold leading-normal text-text-heading">{name}</span>
              <span className="text-sm text-text-subtle leading-normal">{role}</span>
            </div>
            <IconChevronDown />
          </button>

          {dropdownOpen && (
            <div className="absolute top-[calc(100%+4px)] right-0 bg-bg-card border border-border rounded-md shadow-md p-sm flex flex-col min-w-[140px] z-50">
              <button
                type="button"
                className="p-sm px-md text-sm text-text-main text-left rounded-sm w-full transition duration-200 hover:bg-danger-bg hover:text-danger"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
