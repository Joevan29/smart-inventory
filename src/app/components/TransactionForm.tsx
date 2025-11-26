'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { updateStock } from '../actions';
import { toast } from 'sonner';
import { ArrowDownLeft, ArrowUpRight, Package, CheckCircle2, Loader2 } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="bg-slate-100 p-1 rounded-xl flex relative">
        <button
          type="button"
          onClick={() => setType('IN')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all z-10 ${
            type === 'IN'
              ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Stock In
        </button>
        <button
          type="button"
          onClick={() => setType('OUT')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all z-10 ${
            type === 'OUT'
              ? 'bg-white text-rose-700 shadow-sm ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Stock Out
        </button>
      </div>

      <form ref={formRef} action={formAction} className="space-y-5">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="type" value={type} />
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Quantity
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="text-slate-400 w-5 h-5" />
              </div>
              <input 
                name="quantity" 
                type="number" 
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0" 
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-slate-900 font-bold text-lg outline-none transition-all
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
              <div className={`text-xs mt-2 flex justify-between font-medium transition-colors px-1 ${isOutOfStock ? 'text-rose-600' : 'text-slate-400'}`}>
                <span>Available Stock: {stock}</span>
                {isOutOfStock && <span className="font-bold">Not enough stock!</span>}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Reference Note
            </label>
            <textarea 
              name="notes" 
              rows={2}
              placeholder={type === 'IN' ? "e.g. From Supplier ABC..." : "e.g. Order #1234..."} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all resize-none" 
              required 
              disabled={isPending}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isPending || isOutOfStock || !qty}
          className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2
            ${type === 'IN' 
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 disabled:bg-emerald-300' 
              : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 disabled:bg-rose-300'
            } disabled:cursor-not-allowed disabled:active:scale-100`}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
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