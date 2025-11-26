import pool from '../../../lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteButton from '../../components/DeleteButton';
import TransactionForm from '../../components/TransactionForm';
import { 
  MapPin, 
  Package, 
  DollarSign, 
  Pencil, 
  ArrowLeft, 
  CalendarClock, 
  History,
  TrendingUp
} from 'lucide-react';

interface HistoryLog {
  id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  notes: string;
  created_at: Date;
  ending_stock?: number;
}

interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: string;
  location?: string;
  description?: string;
}

async function getProduct(id: string) {
  const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return res.rows[0] as ProductDetail;
}

async function getHistory(id: string) {
  const res = await pool.query(
    'SELECT * FROM stock_movements WHERE product_id = $1 ORDER BY created_at DESC',
    [id]
  );
  return res.rows as HistoryLog[];
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HistoryPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  const history = await getHistory(id);

  if (!product) return notFound();

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(value));
  };

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
                      {product.sku}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      System ID: #{product.id}
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {product.name}
                  </h1>
                  <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
                    {product.description || 'No description provided for this SKU.'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    href={`/edit/${id}`}
                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-all"
                    title="Edit Product"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <div className="scale-100">
                     <DeleteButton id={product.id} productName={product.name} />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Price</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                    <p className="text-lg font-bold text-slate-900">{product.location || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valuation</p>
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(Number(product.price) * product.stock)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" />
                  <h2 className="font-bold text-slate-800">Stock History Log</h2>
                </div>
                <a 
                  href={`/api/export/${id}`} 
                  target="_blank"
                  className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                >
                  Download CSV
                </a>
              </div>
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 font-bold border-b border-slate-200 sticky top-0 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Qty</th>
                      <th className="px-6 py-3 text-right">Balance</th>
                      <th className="px-6 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                          No transaction history found.
                        </td>
                      </tr>
                    ) : (
                      history.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700 text-xs">
                                {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <CalendarClock className="w-3 h-3" />
                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                              log.type === 'IN' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {log.type === 'IN' ? 'Stock In' : 'Stock Out'}
                            </span>
                          </td>
                          <td className={`px-6 py-3.5 text-right font-mono font-bold ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.type === 'IN' ? '+' : '-'}{log.quantity}
                          </td>
                          <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-700">
                            {log.ending_stock ?? '-'}
                          </td>
                          <td className="px-6 py-3.5 text-slate-600 text-xs max-w-xs truncate group-hover:whitespace-normal group-hover:text-clip transition-all">
                            {log.notes}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b border-slate-100">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Stock Level</span>
                <div className="flex items-center justify-center gap-2">
                  <Package className={`w-8 h-8 ${product.stock < 10 ? 'text-rose-500' : 'text-slate-800'}`} />
                  <span className={`text-5xl font-black tracking-tighter ${product.stock < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {product.stock}
                  </span>
                </div>
                {product.stock < 10 && (
                  <span className="inline-block mt-2 bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded border border-rose-100 animate-pulse">
                    Low Stock Warning
                  </span>
                )}
              </div>
              
              <TransactionForm productId={product.id} stock={product.stock} />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}