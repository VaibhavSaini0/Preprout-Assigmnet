import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';

/** Convert a URL slug like "help-support" → "Help & Support", "user-management" → "User Management" */
function slugToLabel(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAnd\b/g, '&');
}

export default function ServiceUnavailablePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive the service name from the current URL path (e.g. /help-support → "Help & Support")
  const pathSegment = location.pathname.replace(/^\//, '').split('/')[0];
  const serviceName = pathSegment ? slugToLabel(pathSegment) : 'The requested service';

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-lg text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-2xl shadow-sm border border-primary/10 text-primary-dark">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-text-heading tracking-tight mb-md">
          Service Not Available
        </h1>
        
        <p className="text-base text-text-main max-w-[480px] mb-xs">
          <strong>{serviceName}</strong> is not available right now.
        </p>
        
        <p className="text-sm text-text-subtle max-w-[400px] mb-3xl">
          This feature is currently under active development. Please check back later or contact support if you need assistance.
        </p>

        <div className="flex gap-md max-sm:flex-col w-full max-w-[320px]">
          <Button onClick={() => navigate('/dashboard')} fullWidth>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
