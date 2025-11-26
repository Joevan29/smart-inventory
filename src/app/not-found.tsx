import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="max-w-md">
        <h1 className="text-9xl font-black text-slate-200">404</h1>
        
        <div className="relative -mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h2>
          <p className="text-slate-500 mb-8">
            Halaman atau data produk yang Anda cari tidak ditemukan di database kami.
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
            </svg>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}