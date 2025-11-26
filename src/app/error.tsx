'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4 text-center font-sans">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-rose-100 max-w-lg w-full relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>

        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-slate-900 mb-3">System Encountered an Error</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          Terjadi kesalahan yang tidak diharapkan. Tim teknis kami mungkin sudah menerima laporan ini. Silakan coba muat ulang.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back Home
          </button>
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
        
        {error.digest && (
          <div className="mt-8 pt-6 border-t border-slate-50">
            <p className="text-[10px] text-slate-400 font-mono bg-slate-50 py-1 px-2 rounded inline-block">
              Error Code: {error.digest}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}