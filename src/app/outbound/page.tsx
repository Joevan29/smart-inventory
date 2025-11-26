import Link from 'next/link';
import BulkTransactionTable from '../components/BulkTransactionTable';
import { ArrowLeft, Truck } from 'lucide-react';

export default function OutboundPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            Bulk Mode Active
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600"></div>
          
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Outbound Order Fulfillment</h1>
                <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                  Mode ini digunakan untuk memproses pengeluaran barang dalam jumlah banyak sekaligus. 
                  Pastikan semua item yang dipilih sesuai dengan surat jalan (Delivery Order).
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-1">
               <BulkTransactionTable type="OUT" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}