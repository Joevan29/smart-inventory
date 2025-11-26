import pool from '../../../lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteButton from '../../components/DeleteButton';
import TransactionForm from '../../components/TransactionForm';
import { MapPin, Package, DollarSign, Pencil } from 'lucide-react';

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
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
            &larr; Back to Dashboard
          </Link>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col xl:flex-row justify-between items-start gap-8">
            <div className="flex-1 w-full space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded tracking-wide border border-blue-100">
                      SKU: {product.sku}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {product.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-slate-100 py-4">
                <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-slate-500" />
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Base Price</p>
                        <p className="font-semibold text-slate-700">{formatCurrency(product.price)}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Rack Location</p>
                        <p className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">{product.location || 'N/A'}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-slate-500" />
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Total Valuation</p>
                        <p className="font-semibold text-slate-700">{formatCurrency(Number(product.price) * product.stock)}</p>
                    </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Description</p>
                <p className="text-sm text-slate-600 italic">
                    {product.description || 'Tidak ada deskripsi produk. Mohon diperbarui di halaman Edit.'}
                </p>
              </div>


              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <Link 
                  href={`/edit/${id}`}
                  className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold transition border border-slate-200"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Info
                </Link>

                <DeleteButton id={product.id} productName={product.name} />

                <a 
                  href={`/api/export/${id}`} 
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
                  </svg>
                  Download Report
                </a>
              </div>
            </div>
            
            {/* Form Transaksi */}
            <div className="w-full xl:w-96 flex-shrink-0">
                <div className="text-right mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-inner">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Stock</span>
                    <span className={`text-4xl font-extrabold ${product.stock < 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {product.stock}
                    </span>
                </div>
                <TransactionForm productId={product.id} stock={product.stock} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-8">
          {/* Audit Log Section (sama seperti sebelumnya) */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800">Audit Log & Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Complete history of stock movements</p>
            </div>
            <span className="text-xs font-medium bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
              {history.length} Records
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/95 backdrop-blur-sm font-semibold border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5 text-center">Ending Stock</th>
                  <th className="px-6 py-3.5">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <p className="text-sm">No transaction history available yet.</p>
                    </td>
                  </tr>
                ) : (
                  history.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-700 text-xs">
                          {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border uppercase ${
                          log.type === 'IN' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-mono font-bold text-sm ${
                            log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {log.type === 'IN' ? '+' : '-'}{log.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-extrabold text-slate-800 text-lg">
                          {log.ending_stock ?? '?'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 italic max-w-sm">
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
    </main>
  );
}