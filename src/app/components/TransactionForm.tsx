'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { updateStock } from '../actions';
import { toast } from 'sonner';
import { ArrowDownLeft, ArrowUpRight, Package, CheckCircle2 } from 'lucide-react';

interface Props {
  productId: number;
  stock: number;
}

export default function TransactionForm({ productId, stock }: Props) {
  const [state, formAction, isPending] = useActionState(updateStock, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [qty, setQty] = useState('');

  const isOutOfStock = type === 'OUT' && (parseInt(qty) > stock);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message, {
        icon: <CheckCircle2 className="text-emerald-500" />,
        className: "bg-emerald-50 border-emerald-100 text-emerald-900 font-medium"
      });
      formRef.current?.reset();
      setQty('');
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => setType('IN')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            type === 'IN'
              ? 'bg-emerald-50/80 text-emerald-700 border-b-2 border-emerald-500'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Stock In
        </button>
        <button
          type="button"
          onClick={() => setType('OUT')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            type === 'OUT'
              ? 'bg-rose-50/80 text-rose-700 border-b-2 border-rose-500'
              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Stock Out
        </button>
      </div>

      <form 
        ref={formRef}
        action={formAction} 
        className="p-4 space-y-4"
      >
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="type" value={type} />
        
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
              Quantity
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                name="quantity" 
                type="number" 
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0" 
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg text-slate-900 font-bold text-lg outline-none transition placeholder:text-slate-300 placeholder:font-normal
                  ${isOutOfStock 
                    ? 'border-rose-300 focus:ring-2 focus:ring-rose-100 bg-rose-50 text-rose-600' 
                    : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
                  }`} 
                required 
                min="1"
                disabled={isPending}
              />
            </div>
            
            {type === 'OUT' && (
              <div className={`text-xs mt-1.5 flex justify-between font-medium transition-colors ${isOutOfStock ? 'text-rose-600' : 'text-slate-400'}`}>
                <span>Available: {stock}</span>
                {isOutOfStock && <span>Not enough stock!</span>}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
              Reference / Notes
            </label>
            <input 
              name="notes" 
              type="text" 
              placeholder={type === 'IN' ? "Source (e.g. Supplier A)" : "Destination (e.g. Order #123)"} 
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition" 
              required 
              disabled={isPending}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isPending || isOutOfStock || !qty}
          className={`w-full py-3 rounded-lg text-sm font-bold text-white transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2
            ${type === 'IN' 
              ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300' 
              : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300'
            } disabled:cursor-not-allowed disabled:active:scale-100`}
        >
          {isPending ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              {type === 'IN' ? 'Confirm Stock In' : 'Confirm Stock Out'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}