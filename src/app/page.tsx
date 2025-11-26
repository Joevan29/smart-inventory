import pool from '@/src/lib/db';
import { updateStock } from './actions';
import Link from 'next/link';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  stock: number;
  price: string;
  image_url: string;
}

async function getProducts() {
  const res = await pool.query('SELECT * FROM products ORDER BY id ASC');
  return res.rows;
}

export default async function Home() {
  const products: Product[] = await getProducts();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800">WMS Enterprise</h1>
            <p className="text-slate-500 text-xs">Warehouse Management System v2.0</p>
          </div>
          <Link href="/add" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">
            + New SKU
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {products.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-6 items-center">
              
              <div className="w-20 h-20 bg-slate-100 rounded-md flex-shrink-0 overflow-hidden">
                 <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 w-full">
                <div className="flex justify-between mb-1">
                  <Link href={`/history/${item.id}`} className="hover:text-blue-600 hover:underline transition">
                    <h3 className="font-bold text-slate-800">{item.name} <span className="text-xs text-slate-400 font-normal">#{item.sku}</span></h3>
                  </Link>
                  <span className={`text-lg font-bold ${item.stock < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                    Stock: {item.stock}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{item.description}</p>
                
                <div className="flex gap-4 w-full">
                  <form action={updateStock} className="flex flex-1 gap-2 bg-green-50 p-2 rounded border border-green-100">
                    <input type="hidden" name="productId" value={item.id} />
                    <input type="hidden" name="type" value="IN" />
                    <input name="quantity" type="number" placeholder="Qty" className="w-16 border rounded px-2 text-xs" required min="1"/>
                    <input name="notes" type="text" placeholder="Source (e.g. Vendor A)" className="flex-1 border rounded px-2 text-xs" required />
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">IN</button>
                  </form>

                  <form action={updateStock} className="flex flex-1 gap-2 bg-red-50 p-2 rounded border border-red-100">
                    <input type="hidden" name="productId" value={item.id} />
                    <input type="hidden" name="type" value="OUT" />
                    <input name="quantity" type="number" placeholder="Qty" className="w-16 border rounded px-2 text-xs" required min="1"/>
                    <input name="notes" type="text" placeholder="Reason (e.g. Sales)" className="flex-1 border rounded px-2 text-xs" required />
                    <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">OUT</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}