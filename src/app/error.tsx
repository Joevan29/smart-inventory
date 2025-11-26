'use client';

import { useEffect } from 'react';

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-rose-100 max-w-md w-full">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Terjadi kesalahan saat memuat data. Ini mungkin masalah koneksi atau server sedang sibuk.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 transition"
          >
            Back Home
          </button>
          <button
            onClick={
              () => reset()
            }
            className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg text-sm hover:bg-rose-700 transition shadow-md"
          >
            Try Again
          </button>
        </div>
        
        {error.digest && (
          <p className="mt-6 text-[10px] text-slate-400 font-mono">
            Error Digest: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}