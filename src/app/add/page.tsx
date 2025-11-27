'use client';

import { createProduct, generateDescription } from '../actions';
import Link from 'next/link';
import { Box, MapPin, Layers, Tag, AlignLeft, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Zap } from 'lucide-react';
import { useActionState, useState } from 'react'; 
import { toast } from 'sonner';

export default function AddProductPage() {
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const [description, setDescription] = useState(''); 
  const [isGenerating, setIsGenerating] = useState(false); 

  const handleGenerateDescription = async (formData: FormData) => {
    const sku = formData.get('sku') as string;
    const name = formData.get('name') as string;

    if (!sku || !name) {
        toast.error("SKU dan Nama produk harus diisi terlebih dahulu!");
        return;
    }
    
    setIsGenerating(true);
    toast.info("AI sedang merangkai deskripsi...");

    try {
        const result = await generateDescription(sku, name);

        if (result.success && result.description) {
            setDescription(result.description);
            toast.success("Deskripsi AI berhasil dibuat!");
        } else {
            toast.error(result.message || "Gagal menghasilkan deskripsi AI.");
        }
    } catch (e) {
        toast.error("Terjadi kesalahan saat memanggil layanan AI.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 flex justify-center items-start md:items-center font-sans">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900"></div>

          <div className="flex items-start gap-4 mb-8">
            <div className="p-3.5 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Register New SKU</h1>
              <p className="text-slate-500 text-sm mt-1">Add a new product to the master inventory database.</p>
            </div>
          </div>

          {state?.message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${
                state.errors ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
               {state.errors ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
               {state.message}
            </div>
          )}

          {/* Form utama menggunakan createProduct Server Action */}
          <form action={formAction} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Tag className="w-4 h-4 text-slate-400" /> Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">SKU Code</label>
                      <input 
                        name="sku" 
                        type="text" 
                        placeholder="e.g. K-001-ARA" 
                        required 
                        className={`w-full border p-3 rounded-xl text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm font-medium transition-all ${state?.errors?.sku ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
                      />
                      {state?.errors?.sku && (
                        <p className="mt-1 text-[10px] font-bold text-rose-500">{state.errors.sku[0]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Product Name</label>
                      <input 
                        name="name" 
                        type="text" 
                        placeholder="e.g. Premium Arabica Coffee" 
                        required 
                        className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-medium transition-all hover:border-slate-300" 
                      />
                      {state?.errors?.name && (
                        <p className="mt-1 text-[10px] font-bold text-rose-500">{state.errors.name[0]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Base Price (IDR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                        <input 
                          name="price" 
                          type="number" 
                          placeholder="0"
                          required 
                          min="100" 
                          className="w-full border border-slate-200 bg-slate-50 p-3 pl-10 rounded-xl text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-bold transition-all hover:border-slate-300" 
                        />
                      </div>
                      {state?.errors?.price && (
                        <p className="mt-1 text-[10px] font-bold text-rose-500">{state.errors.price[0]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Layers className="w-4 h-4 text-slate-400" /> Storage Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 flex items-center justify-between">
                        <span>Rack Location</span>
                        <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Active Zone</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 w-4 h-4" />
                        <input 
                          name="location" 
                          type="text" 
                          placeholder="Zone-Rack-Level (e.g. A-01-05)" 
                          required 
                          className="w-full border border-emerald-100 bg-emerald-50/30 p-3 pl-10 rounded-xl text-emerald-900 placeholder:text-emerald-900/30 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-bold text-sm tracking-wide transition-all" 
                        />
                      </div>
                      {state?.errors?.location && (
                        <p className="mt-1 text-[10px] font-bold text-rose-500">{state.errors.location[0]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 flex items-center gap-2">
                        <AlignLeft className="w-3 h-3" /> Description
                      </label>
                      <textarea 
                        name="description" 
                        rows={4} 
                        placeholder="Write a brief description about the product specifications..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-sm font-medium resize-none hover:border-slate-300"
                      ></textarea>
                    </div>

                    <div className="pt-2">
                        <form action={handleGenerateDescription}>
                            <input type="hidden" name="sku" defaultValue={(document.getElementsByName('sku')[0] as HTMLInputElement)?.value} />
                            <input type="hidden" name="name" defaultValue={(document.getElementsByName('name')[0] as HTMLInputElement)?.value} />
                            <button
                                type="submit"
                                disabled={isGenerating || isPending}
                                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-900 border border-slate-300 bg-yellow-50 hover:bg-yellow-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-yellow-600" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 text-yellow-600" /> Generate Description with AI
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
              <Link 
                href="/" 
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isPending}
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 active:scale-[0.98] text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="w-4 h-4" /> Save Master Data
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}