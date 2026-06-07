import AppLayout from '../components/layout/AppLayout';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Spinner from '../components/ui/Spinner';
import { useDashboard } from '../hooks/useDashboard';
import {
  IconTestCreation,
  IconEye,
  IconChevronRight,
  IconBook,
} from '../components/icons/Icons';

export default function DashboardPage() {
  const {
    navigate,
    subjects,
    loading,
    error,
    stats,
    handleCreateNew,
  } = useDashboard();

  return (
    <AppLayout>
      <div className="mb-2xl">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />
        <h1 className="text-2xl font-semibold text-text-heading mt-md">Dashboard Overview</h1>
        <p className="text-sm text-text-subtle mt-xs">Welcome back! Here is a summary of the test database metrics.</p>
      </div>

      <div className="grid grid-cols-3 gap-lg mb-2xl max-md:grid-cols-1">
        {[
          { label: 'Total Tests Created', value: stats.total, color: 'text-primary-dark', bg: 'bg-primary-light' },
          { label: 'Live Active Tests', value: stats.live, color: 'text-success', bg: 'bg-success-bg' },
          { label: 'Saved Drafts', value: stats.draft, color: 'text-[#d97706]', bg: 'bg-[#fef3c7]' },
        ].map((stat) => (
          <div key={stat.label} className="bg-bg-card border border-border rounded-lg p-xl shadow-sm hover:shadow-card transition duration-150">
            <p className="text-xs font-semibold text-text-subtle uppercase tracking-wide mb-xs">{stat.label}</p>
            <p className={`text-3.5xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-base font-semibold text-text-heading mb-lg">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-xl mb-2xl max-sm:grid-cols-1">
        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-xl p-2xl bg-bg-card border border-border rounded-lg text-left shadow-sm hover:shadow-card hover:border-primary/50 transition duration-150 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary-dark shrink-0">
            <IconTestCreation width={24} height={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-heading text-sm group-hover:text-primary transition-colors">Create New Test</h3>
            <p className="text-xs text-text-subtle mt-xs">Configure name, subject, marking scheme and add questions</p>
          </div>
          <IconChevronRight className="text-text-subtle group-hover:text-primary transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/tracking')}
          className="flex items-center gap-xl p-2xl bg-bg-card border border-border rounded-lg text-left shadow-sm hover:shadow-card hover:border-primary/50 transition duration-150 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-success-bg flex items-center justify-center text-success shrink-0">
            <IconEye width={24} height={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-heading text-sm group-hover:text-primary transition-colors">Test Tracking</h3>
            <p className="text-xs text-text-subtle mt-xs">Search, filter, view, edit and delete your tests</p>
          </div>
          <IconChevronRight className="text-text-subtle group-hover:text-primary transition-colors" />
        </button>
      </div>

      <h2 className="text-base font-semibold text-text-heading mb-lg">Configured Subjects</h2>
      <div className="bg-bg-card border border-border rounded-lg shadow-sm p-xl">
        {loading ? (
          <Spinner label="Loading subjects..." className="py-8" />
        ) : error ? (
          <p className="text-danger text-sm">{error}</p>
        ) : subjects.length === 0 ? (
          <p className="text-text-subtle text-sm">No subjects available.</p>
        ) : (
          <div className="grid grid-cols-3 gap-md max-md:grid-cols-2 max-sm:grid-cols-1">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-md p-lg border border-border rounded-md bg-bg-page/50 hover:bg-bg-page hover:border-border-input transition duration-150"
              >
                <div className="w-9 h-9 rounded-md bg-badge-topic-bg border border-badge-topic-border flex items-center justify-center text-badge-topic-text">
                  <IconBook width={16} height={16} />
                </div>
                <span className="text-sm font-semibold text-text-main">{sub.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
