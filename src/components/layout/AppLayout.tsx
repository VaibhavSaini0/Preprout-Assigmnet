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
    <div className="flex h-screen flex-col overflow-hidden bg-bg-page">
      <TopNav />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar showQuestionPanel={showQuestionPanel} questionPanel={questionPanel} />
        <main className="flex-1 min-h-0 overflow-y-auto md:p-xl md:px-2xl md:pb-xl">
          <div className="max-w-content-max mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
