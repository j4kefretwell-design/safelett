export function DashboardSkeleton() {
  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full animate-pulse">
      <div className="h-48 w-full bg-study/15 sm:h-56" />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
        <div className="h-8 w-56 bg-study/10" />
        <div className="mt-3 h-4 w-80 max-w-full bg-study/10" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 bg-study/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function RemindersSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full animate-pulse">
      <div className="h-56 w-full bg-study/20" />
      <div className="mx-auto max-w-4xl space-y-4 px-5 py-10 sm:px-10">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 bg-study/10" />
        ))}
      </div>
    </div>
  );
}

export function TenancyDashboardSkeleton() {
  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)] w-full animate-pulse">
      <div className="h-48 w-full bg-navy/20 sm:h-56" />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
        <div className="h-8 w-52 bg-navy/15" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 bg-navy/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-5 py-12 sm:px-10">
      <div className="h-8 w-40 bg-study/10" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-14 bg-study/10" />
        ))}
      </div>
    </div>
  );
}

export function AssistantSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-study">
      <aside className="hidden w-[200px] shrink-0 bg-study sm:block" />
      <div className="relative flex flex-1 items-center justify-center bg-study/80 p-6">
        <div className="h-[88%] w-[92%] animate-pulse rounded-[16px] bg-parchment-line/90" />
      </div>
    </div>
  );
}

export function ImportSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-5 py-16 sm:px-10">
      <div className="h-8 w-48 bg-study/10" />
      <div className="mt-6 h-4 w-full max-w-md bg-study/10" />
      <div className="mt-10 h-40 bg-study/10" />
    </div>
  );
}
