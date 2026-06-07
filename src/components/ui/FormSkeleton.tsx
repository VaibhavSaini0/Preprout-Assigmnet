export function FormSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 gap-x-2xl gap-y-xl mb-2xl max-md:grid-cols-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-sm">
            <div className="h-4 w-24 bg-border rounded-sm" />
            <div className="h-input bg-border/60 rounded-md" />
          </div>
        ))}
      </div>
      <div className="h-4 w-32 bg-border rounded-sm mb-lg" />
      <div className="grid grid-cols-5 gap-lg max-lg:grid-cols-3 max-md:grid-cols-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-sm">
            <div className="h-3 w-20 bg-border rounded-sm" />
            <div className="h-input bg-border/60 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
