'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '../actions';
import { toast } from 'sonner';
import { Trash2, AlertTriangle } from 'lucide-react';
import Modal from './modal'; 

export default function DeleteButton({ id, productName }: { id: number, productName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteProduct(id);

    if (result.success) {
      toast.success(result.message);
      setIsModalOpen(false);
      router.push('/');
      router.refresh();
    } else {
      toast.error(result.message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isDeleting}
        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
        title="Delete Product"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
            <div className="p-2 bg-white rounded-full shadow-sm shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
                <h4 className="font-bold text-rose-700 text-sm">Warning: Permanent Action</h4>
                <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                    You are about to delete <strong>"{productName}"</strong>. This will also delete all associated transaction history logs. This action cannot be undone.
                </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-rose-600 rounded-xl text-sm font-bold text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}