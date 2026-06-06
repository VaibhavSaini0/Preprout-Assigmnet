import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

interface AppLayoutProps {
  children: ReactNode;
  showQuestionPanel?: boolean;
  questionPanel?: ReactNode;
}

export default function AppLayout({ children, showQuestionPanel, questionPanel }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar showQuestionPanel={showQuestionPanel} questionPanel={questionPanel} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-lg md:p-xl md:px-2xl md:pb-3xl overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
