import pool from '@/src/lib/db';
import { editProduct } from '@/src/app/actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: string;
}

async function getProduct(id: string) {
  const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return res.rows[0] as ProductDetail;
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return notFound();

  const updateProductWithId = editProduct.bind(null, product.id);

  return (
    <main className="min-h-screen bg-slate-50 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Edit Product Info</h1>
          <span className="bg-slate-100 text-slate-500 text-xs font-mono px-2 py-1 rounded">ID: {product.id}</span>
        </div>

        <form action={updateProductWithId} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">SKU Code</label>
              <input 
                name="sku" 
                type="text" 
                required 
                defaultValue={product.sku}
                className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Product Name</label>
              <input 
                name="name" 
                type="text" 
                required 
                defaultValue={product.name}
                className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
            <textarea 
              name="description" 
              rows={3} 
              required 
              defaultValue={product.description}
              className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Base Price (Rp)</label>
            <input 
              name="price" 
              type="number" 
              required 
              defaultValue={product.price}
              className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Link 
              href={`/history/${product.id}`} 
              className="flex-1 text-center bg-slate-100 text-slate-600 py-2.5 rounded hover:bg-slate-200 transition text-sm font-bold"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 transition font-bold text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}