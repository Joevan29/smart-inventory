'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updateStock } from '../actions';
import { toast } from 'sonner';
import { Loader2, Package, FileText, MapPin } from 'lucide-react';

interface Props {
  productId: number;
  productName: string;
  location?: string;
  currentStock: number;
  type: 'IN' | 'OUT';
  onSuccess: () => void;
}

export default function QuickTransactionForm({ 
  productId, 
  productName, 
  location,
  currentStock, 
  type, 
  onSuccess 
}: Props) {
  const [state, formAction, isPending] = useActionState(updateStock, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(`${state.message} Stock Akhir: ${currentStock + (type === 'IN' ? parseInt(formRef.current?.quantity.value || '0') : -parseInt(formRef.current?.quantity.value || '0'))} Units`, {
        duration: 5000,
        style: { backgroundColor: '#f0fdf4', borderColor: '#dcfce7', color: '#16a34a' }
      });
      onSuccess();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state, onSuccess, currentStock, type]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="type" value={type} />

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2">
        <p className="font-bold text-slate-900 line-clamp-1">{productName}</p>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Package className="w-3 h-3" /> Current Stock:
          </span>
          <span className={`font-bold ${currentStock < 10 ? 'text-rose-600' : 'text-slate-700'}`}>
            {currentStock} Units
          </span>
        </div>
        {location && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location:
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {location}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Quantity {type === 'IN' ? '(Addition)' : '(Reduction)'}
        </label>
        <div className="relative">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            name="quantity" 
            type="number" 
            min="1"
            required
            autoFocus
            placeholder="0"
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-bold"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          Notes / Reference
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            name="notes" 
            type="text" 
            required
            placeholder={type === 'IN' ? "PO Number / Supplier" : "Order ID / Reason"}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-2
            ${type === 'IN' 
              ? 'bg-emerald-600 hover:bg-emerald-700' 
              : 'bg-rose-600 hover:bg-rose-700'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
            </>
          ) : (
            <>Confirm {type === 'IN' ? 'Stock In' : 'Stock Out'}</>
          )}
        </button>
      </div>
    </form>
  );
}