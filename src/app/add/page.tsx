import { createProduct } from '../actions';
import Link from 'next/link';
import { Box, MapPin } from 'lucide-react';

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 p-8 flex justify-center items-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-slate-900 rounded-lg text-white">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Register New SKU</h1>
            <p className="text-slate-500 text-sm">Daftarkan item baru ke database master.</p>
          </div>
        </div>

        <form action={createProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">SKU Code</label>
                <input 
                  name="sku" 
                  type="text" 
                  required 
                  placeholder="Ex: K001" 
                  className="w-full border border-slate-300 bg-slate-50 p-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 outline-none font-mono font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Product Name</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="Ex: Kopi Arabika" 
                  className="w-full border border-slate-300 bg-slate-50 p-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 outline-none font-medium" 
                />
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
                    className="w-full border border-slate-300 bg-slate-50 p-3 pl-10 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 outline-none font-medium" 
                  />
                </div>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Rack Location
                </label>
                <input 
                  name="location" 
                  type="text" 
                  required 
                  placeholder="Ex: A-01-05 (Zone-Rack-Level)" 
                  className="w-full border border-emerald-200 bg-emerald-50/30 p-3 rounded-lg text-emerald-900 placeholder:text-emerald-900/40 focus:ring-2 focus:ring-emerald-500 outline-none font-bold tracking-wide" 
                />
                <p className="text-[10px] text-slate-400 mt-1">Format: Zone - Rack - Level</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Description</label>
                <textarea 
                  name="description" 
                  rows={4} 
                  required 
                  placeholder="Brief product description..."
                  className="w-full border border-slate-300 bg-slate-50 p-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 outline-none transition font-medium resize-none h-[132px]"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <Link href="/" className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm">
              Cancel
            </Link>
            <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-all font-bold shadow-md active:scale-[0.98] text-sm">
              Save Master Data
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}