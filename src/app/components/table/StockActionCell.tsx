'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Modal from '../modal';
import QuickTransactionForm from '../QuickTransactionForm';
import { Product } from './columns';

interface Props {
  product: Product;
}

export default function StockActionCell({ product }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<'IN' | 'OUT'>('IN');

  const handleOpen = (type: 'IN' | 'OUT') => {
    setActionType(type);
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleOpen('IN')}
          className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all shadow-sm group"
          title="Quick Stock In"
        >
          <Plus className="w-3.5 h-3.5 group-active:scale-90 transition-transform" />
        </button>
        
        <button
          onClick={() => handleOpen('OUT')}
          className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 transition-all shadow-sm group"
          title="Quick Stock Out"
        >
          <Minus className="w-3.5 h-3.5 group-active:scale-90 transition-transform" />
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={actionType === 'IN' ? '📥 Register Stock In' : 'wj Register Stock Out'}
      >
        <QuickTransactionForm 
          productId={product.id}
          productName={product.name}
          currentStock={product.stock}
          type={actionType}
          onSuccess={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}