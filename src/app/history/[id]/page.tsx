import pool from '../../../lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteButton from '../../components/DeleteButton';
import TransactionForm from '../../components/TransactionForm';

interface HistoryLog {
  id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  notes: string;
  created_at: Date;
}

interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: string;
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

export default async function HistoryPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id);
  const history = await getHistory(id);

  if (!product) return notFound();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors">
            &larr; Back to Dashboard
          </Link>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded border border-blue-200">
                  SKU: {product.sku}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {product.id}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
              <p className="text-slate-500 mt-1 text-sm">Base Price: Rp {Number(product.price).toLocaleString('id-ID')}</p>
              
              <div className="flex gap-2 mt-6">
                <Link 
                  href={`/edit/${id}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition border border-slate-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                  </svg>
                  Edit Info
                </Link>

                <DeleteButton id={product.id} productName={product.name} />

                <a 
                  href={`/api/export/${id}`} 
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
                  </svg>
                  Download Report
                </a>
              </div>
            </div>
            
            <div className="w-full md:w-80 flex-shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="text-right mb-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Stock</span>
                    <span className={`text-4xl font-extrabold ${product.stock < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                    {product.stock}
                    </span>
                </div>
                <TransactionForm productId={product.id} stock={product.stock} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800">Audit Log & Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Complete history of stock movements</p>
            </div>
            <span className="text-xs font-medium bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
              {history.length} Records
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold w-1/4">Date & Time</th>
                  <th className="px-6 py-4 font-semibold w-1/6">Type</th>
                  <th className="px-6 py-4 font-semibold w-1/6">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <p>No transaction history available yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  history.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">
                        <div className="font-medium text-slate-700">
                          {new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          log.type === 'IN' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {log.type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-bold text-base ${
                            log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {log.type === 'IN' ? '+' : '-'}{log.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
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