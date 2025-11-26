import pool from '@/src/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4">
            &larr; Back to Dashboard
          </Link>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-end">
            <div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                SKU: {product.sku}
              </span>
              <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
              <p className="text-slate-500 mt-1">Base Price: Rp {Number(product.price).toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Stock</span>
              <span className={`text-4xl font-extrabold ${product.stock < 10 ? 'text-red-600' : 'text-slate-900'}`}>
                {product.stock}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Transaction History (Audit Log)</h2>
            <span className="text-xs text-slate-500">{history.length} records found</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Quantity</th>
                  <th className="px-6 py-4 font-medium">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                      No transaction history available.
                    </td>
                  </tr>
                ) : (
                  history.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          log.type === 'IN' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold ${
                          log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {log.type === 'IN' ? '+' : '-'}{log.quantity}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
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