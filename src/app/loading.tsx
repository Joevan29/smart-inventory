import { Skeleton } from "./components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-32 relative overflow-hidden">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </section>

        <div className="h-[400px] w-full bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-end gap-4 h-[300px] px-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${Math.random() * 100}%` }} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
          
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 flex gap-6">
              <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}