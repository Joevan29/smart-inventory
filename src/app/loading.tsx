import { Skeleton } from "./components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      <div className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="hidden h-8 w-32 rounded-full md:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="mt-6 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
          <div className="h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-6 h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
          <div className="h-40 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-6 h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </section>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:flex-row">
          <Skeleton className="h-10 w-full rounded-xl md:max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="p-0">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-6 py-4 last:border-0">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="hidden h-6 w-24 md:block" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-1">
            <div className="h-[450px] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="mb-2 h-6 w-40" />
              <Skeleton className="mb-8 h-4 w-24" />
              <div className="flex h-64 items-end gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${Math.random() * 80 + 20}%` }} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}