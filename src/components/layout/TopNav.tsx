import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestContext } from '../../context/TestContext';
import { Logo, IconBell, IconChevronDown } from '../icons/Icons';

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
    <header className="flex items-center w-full justify-between h-[72px] px-2xl bg-bg-card border-b border-border shrink-0 max-sm:px-lg">
      <div className={"h-full pl-5 pr-11 flex justify-center items-center border-r-1 border-border"}>

      <Logo className="h-7 w-auto shrink-0" />
      </div>

      <div className="flex items-center gap-lg">
        <button
          className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border text-text-main bg-bg-card hover:bg-bg-tab-active transition-colors duration-150"
          type="button"
          aria-label="Notifications"
          title="Notifications (coming soon)"
        >
          <IconBell />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-success rounded-full border-2 border-white" />
        </button>

        <div className="relative" ref={wrapperRef}>
          <button
            className="flex items-center gap-md p-sm px-md rounded-lg hover:bg-bg-tab-active transition duration-150"
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-expanded={dropdownOpen}
            aria-label="User profile menu"
          >
            <img
              src={"/usericon.png"}
              alt={name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="flex flex-col items-start text-left max-sm:hidden">
              <span className="text-sm font-semibold text-text-heading leading-tight">{name}</span>
              <span className="text-xs text-text-subtle">{role}</span>
            </div>
            <IconChevronDown className="text-text-subtle max-sm:hidden" />
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
