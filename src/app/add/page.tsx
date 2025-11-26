import { createProduct } from '@/src/app/actions';
import Link from 'next/link';

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-slate-200">
        <h1 className="text-2xl font-bold mb-1 text-slate-800">Register New SKU</h1>
        <p className="text-slate-500 mb-6 text-sm">Daftarkan item baru ke database master.</p>

        <form action={createProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">SKU Code</label>
              <input name="sku" type="text" required placeholder="Ex: K001" className="w-full border p-2 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Product Name</label>
              <input name="name" type="text" required placeholder="Ex: Kopi Arabika" className="w-full border p-2 rounded text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
            <textarea name="description" rows={2} required className="w-full border p-2 rounded text-sm"></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Base Price</label>
            <input name="price" type="number" required className="w-full border p-2 rounded text-sm" />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded hover:bg-slate-800 transition font-bold mt-4">
            Save Master Data
          </button>
          
          <Link href="/" className="block text-center text-sm text-slate-500 mt-4 hover:underline">
            Cancel
          </Link>
        </form>
      </div>
    </main>
  );
}