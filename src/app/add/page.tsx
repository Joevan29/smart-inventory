import { createProduct } from '../actions';
import Link from 'next/link';

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 p-8 flex justify-center items-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-slate-200">
        <h1 className="text-2xl font-bold mb-1 text-slate-900">Register New SKU</h1>
        <p className="text-slate-500 mb-6 text-sm">Daftarkan item baru ke database master.</p>

        <form action={createProduct} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">SKU Code</label>
              <input 
                name="sku" 
                type="text" 
                required 
                placeholder="Ex: K001" 
                className="w-full border border-slate-300 bg-slate-50 p-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition font-medium" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Product Name</label>
              <input 
                name="name" 
                type="text" 
                required 
                placeholder="Ex: Kopi Arabika" 
                className="w-full border border-slate-300 bg-slate-50 p-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition font-medium" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Description</label>
            <textarea 
              name="description" 
              rows={3} 
              required 
              placeholder="Brief product description..."
              className="w-full border border-slate-300 bg-slate-50 p-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition font-medium resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Base Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">Rp</span>
              <input 
                name="price" 
                type="number" 
                required 
                placeholder="0"
                className="w-full border border-slate-300 bg-slate-50 p-3 pl-10 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition font-medium" 
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-all font-bold shadow-md active:scale-[0.98]">
              Save Master Data
            </button>
            
            <Link href="/" className="block text-center text-sm text-slate-500 mt-4 hover:text-slate-800 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}