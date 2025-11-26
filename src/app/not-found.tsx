import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4 text-center font-sans">
      <div className="relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl -z-10"></div>
        
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <FileQuestion className="w-10 h-10 text-slate-400" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Page Not Found</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau data produk tersebut tidak tersedia di database kami.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 w-full bg-white text-slate-600 border border-slate-200 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
        WMS Enterprise System • 404 Error
      </p>
    </main>
  );
}