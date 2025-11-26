import Link from 'next/link';
import BulkTransactionTable from '../components/BulkTransactionTable';

export default function OutboundPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6 transition-colors">
            &larr; Back to Dashboard
        </Link>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Outbound Order Fulfillment</h1>
            <p className="text-slate-500 text-sm mt-1 mb-6">Process multiple customer orders and reduce stock levels in bulk.</p>
            
            <BulkTransactionTable type="OUT" />
        </div>
      </div>
    </main>
  );
}