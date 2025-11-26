import pool from '@/src/lib/db';
import { editProduct } from '@/src/app/actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowLeft, Save, Tag, AlignLeft, PenLine } from 'lucide-react';

interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: string;
  location?: string;
}

async function getProduct(id: string) {
  const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return res.rows[0] as ProductDetail;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return notFound();

  const updateProductWithId = editProduct.bind(null, product.id);

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex justify-center items-start font-sans">
      <div className="w-full max-w-3xl space-y-6">
        
        <div className="flex items-center justify-between">
          <Link 
            href={`/history/${product.id}`} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Details
          </Link>
          <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">ID: {product.id}</span>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
          {/* Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>

          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <PenLine className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Edit Product</h1>
              <p className="text-slate-500 text-sm">Update information for <span className="font-bold text-slate-700">{product.name}</span></p>
            </div>
          </div>

          <form action={updateProductWithId} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Tag className="w-4 h-4 text-slate-400" /> Product Identity
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">SKU Code</label>
                      <input 
                        name="sku" 
                        type="text" 
                        required 
                        defaultValue={product.sku}
                        className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono text-sm font-medium transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Product Name</label>
                      <input 
                        name="name" 
                        type="text" 
                        required 
                        defaultValue={product.name}
                        className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm font-medium transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Base Price (IDR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                        <input 
                          name="price" 
                          type="number" 
                          required 
                          defaultValue={product.price}
                          className="w-full border border-slate-200 bg-slate-50 p-3 pl-10 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-sm font-bold transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400" /> Logistics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Rack Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 w-4 h-4" />
                        <input 
                          name="location" 
                          type="text" 
                          required 
                          defaultValue={product.location || ''}
                          className="w-full border border-emerald-200 bg-emerald-50/30 p-3 pl-10 rounded-xl text-emerald-900 placeholder:text-emerald-900/30 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-sm tracking-wide transition-all" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 flex items-center gap-2">
                        <AlignLeft className="w-3 h-3" /> Description
                      </label>
                      <textarea 
                        name="description" 
                        rows={4} 
                        required 
                        defaultValue={product.description}
                        className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-sm font-medium resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4">
              <Link 
                href={`/history/${product.id}`} 
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
              >
                Discard Changes
              </Link>
              <button 
                type="submit" 
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 active:scale-[0.98] text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}