interface TabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div
      className="inline-flex bg-bg-card border border-border rounded-md p-[3px] gap-[2px] max-w-full overflow-x-auto"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`px-[20px] py-[10px] rounded-sm text-sm font-medium transition duration-150 whitespace-nowrap max-sm:px-3.5 max-sm:py-2 max-sm:text-xs border ${
              isActive
                ? 'bg-bg-tab-active text-primary border-primary/30'
                : 'text-text-subtle hover:text-text-main border-transparent'
            }`}
            onClick={() => onChange(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
