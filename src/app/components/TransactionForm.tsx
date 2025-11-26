'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updateStock } from '../actions';
import { toast } from 'sonner';

interface Props {
  productId: number;
  type: 'IN' | 'OUT';
}

export default function TransactionForm({ productId, type }: Props) {
  const [state, formAction, isPending] = useActionState(updateStock, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state?.success === false) {
      toast.error(state.message);
    }
  }, [state]);

  const isIncoming = type === 'IN';

  return (
    <form 
      ref={formRef}
      action={formAction} 
      className={`flex flex-1 gap-2 items-center p-1 rounded transition-colors ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="type" value={type} />
      
      <div className="relative w-20">
         <input 
           name="quantity" 
           type="number" 
           placeholder="Qty" 
           className={`w-full px-2 py-1.5 border rounded text-xs outline-none transition
             ${isIncoming 
               ? 'border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
               : 'border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
             }`} 
           required 
           min="1"
           disabled={isPending}
         />
      </div>
      
      <input 
        name="notes" 
        type="text" 
        placeholder={isIncoming ? "Source (e.g. Vendor)" : "Reason (e.g. Sales)"} 
        className={`flex-[2] px-2 py-1.5 border rounded text-xs outline-none transition
          ${isIncoming 
            ? 'border-slate-200 focus:border-emerald-500' 
            : 'border-slate-200 focus:border-rose-500'
          }`} 
        required 
        disabled={isPending}
      />
      
      <button 
        type="submit" 
        disabled={isPending}
        className={`px-3 py-1.5 rounded text-xs font-bold text-white transition shadow-sm flex items-center justify-center min-w-[50px]
          ${isIncoming 
            ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400' 
            : 'bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400'
          }`}
      >
        {isPending ? (
          <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
        ) : (
          type
        )}
      </button>
    </form>
  );
}