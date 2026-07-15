export function OverviewSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#F2EDE8]">
      <div className="relative h-[60vh] min-h-[360px] w-full overflow-hidden bg-[#3D2B1F]/20 md:h-[calc((100vh-4rem)*0.85)] md:min-h-[440px]">
        <div className="absolute inset-x-0 top-1/2 flex h-[60%] -translate-y-1/2 items-center justify-center gap-3 px-4 sm:px-16">
          <div className="skeleton-shimmer hidden h-[200px] w-[22%] rounded-[20px] md:block" />
          <div className="skeleton-shimmer h-[200px] w-full max-w-[520px] rounded-[20px] md:h-[220px] md:w-[50%]" />
          <div className="skeleton-shimmer hidden h-[200px] w-[22%] rounded-[20px] md:block" />
        </div>
      </div>
      <div className="px-4 py-14 sm:px-6 lg:px-12">
        <div className="skeleton-shimmer h-3 w-36" />
        <div className="skeleton-shimmer mt-3 h-px w-16" />
        <div className="mt-10 space-y-0">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="skeleton-shimmer h-14 border-b border-[#C5AC91]/40"
            />
          ))}
        </div>
      </div>
      <div className="flex min-h-[160px] flex-col items-center justify-center bg-[#1C2B23] px-6 py-12">
        <div className="skeleton-shimmer h-3 w-48 bg-white/10" />
        <div className="skeleton-shimmer mt-5 h-6 w-full max-w-xl bg-white/10" />
        <div className="skeleton-shimmer mt-6 h-4 w-32 bg-white/10" />
      </div>
      <div className="grid grid-cols-1 bg-[#EDE6DF] md:grid-cols-[40%_60%]">
        <div className="skeleton-shimmer h-[200px] md:min-h-[420px]" />
        <div className="px-8 py-14 sm:px-12 lg:px-16">
          <div className="skeleton-shimmer h-3 w-24" />
          <div className="skeleton-shimmer mt-3 h-px w-16" />
          <div className="skeleton-shimmer mt-8 h-10 w-48" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton-shimmer h-4 w-64 max-w-full" />
            ))}
          </div>
          <div className="skeleton-shimmer mt-10 h-px w-16" />
          <div className="skeleton-shimmer mt-8 h-4 w-44" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full">
      <div className="skeleton-shimmer h-[200px] w-full sm:h-[280px] lg:h-[320px]" />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-36" />
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 px-5 sm:px-10 lg:grid-cols-[45%_55%]">
        <div className="skeleton-shimmer hidden min-h-[280px] lg:block" />
        <div className="skeleton-shimmer min-h-[220px] sm:min-h-[280px]" />
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer h-36" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function RemindersSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#F2EDE8]">
      <div className="skeleton-shimmer h-56 w-full sm:h-64" />
      <div className="mx-auto max-w-4xl space-y-4 px-5 py-10 sm:px-10">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton-shimmer h-20" />
        ))}
      </div>
    </div>
  );
}

export function TenancyDashboardSkeleton() {
  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)] w-full">
      <div className="skeleton-shimmer-navy h-[200px] w-full sm:h-[280px] lg:h-[320px]" />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer-navy h-36" />
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 px-5 sm:px-10 lg:grid-cols-[45%_55%]">
        <div className="skeleton-shimmer-navy hidden min-h-[280px] lg:block" />
        <div className="skeleton-shimmer-navy min-h-[220px] sm:min-h-[280px]" />
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-shimmer-navy h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-10">
      <div className="skeleton-shimmer h-8 w-40" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-shimmer h-14" />
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
        <div className="skeleton-shimmer h-[88%] w-[92%] rounded-[16px]" />
      </div>
    </div>
  );
}

export function ImportSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-10">
      <div className="skeleton-shimmer h-8 w-48" />
      <div className="skeleton-shimmer mt-6 h-4 w-full max-w-md" />
      <div className="skeleton-shimmer mt-10 h-40" />
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full">
      <div className="skeleton-shimmer h-28 w-full" />
      <div className="space-y-5 px-5 py-10 sm:px-12 lg:px-16">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="skeleton-shimmer h-40" />
        ))}
      </div>
    </div>
  );
}
