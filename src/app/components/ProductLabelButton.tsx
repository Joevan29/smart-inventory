'use client';

import { useState } from 'react';
import { Printer, QrCode, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Modal from './modal';

interface Props {
  product: {
    id: number;
    sku: string;
    name: string;
    price: string;
    location?: string;
  };
}

export default function ProductLabelButton({ product }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const copySKU = () => {
    navigator.clipboard.writeText(product.sku);
    toast.success('SKU copied to clipboard');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${product.sku}`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center gap-2"
      >
        <QrCode className="w-3.5 h-3.5" />
        Print Label
      </button>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Product Label Preview">
          <div className="space-y-6">
            {/* --- Label Preview Area --- */}
            <div className="bg-slate-100 p-8 rounded-xl flex justify-center items-center border border-slate-200/60">
              <div 
                id="printable-label" 
                className="bg-white w-[320px] h-[200px] p-4 rounded-lg shadow-sm border border-slate-300 flex flex-col relative overflow-hidden"
              >
                {/* Decorative Stripe */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-900"></div>
                
                <div className="pl-4 flex h-full gap-4">
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WMS Asset Tag</p>
                      <h2 className="text-lg font-extrabold text-slate-900 leading-tight line-clamp-2 mt-1">
                        {product.name}
                      </h2>
                      <p className="font-mono text-sm font-bold text-slate-600 mt-1">{product.sku}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Loc:</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-1.5 rounded">{product.location || 'N/A'}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(product.price))}
                      </p>
                    </div>
                  </div>

                  <div className="w-24 flex flex-col justify-center items-center gap-2 border-l border-slate-100 pl-4">
                    {/* QR Code Image */}
                    <img 
                      src={qrUrl} 
                      alt="QR Code" 
                      className="w-20 h-20 object-contain mix-blend-multiply" 
                    />
                    <span className="text-[8px] text-slate-400 font-mono text-center leading-tight">
                      Scan for details
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copySKU}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy SKU
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                Print Now
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">
              Use a label printer (e.g. Zebra/Dymo) for best results. Format: 80mm x 50mm.
            </p>
          </div>

          <style jsx global>{`
            @media print {
              @page { margin: 0; }
              body * { visibility: hidden; }
              #printable-label, #printable-label * { visibility: visible; }
              #printable-label {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) scale(1.5); /* Scale up for better quality */
                border: 1px solid #000;
                box-shadow: none;
                z-index: 9999;
              }
            }
          `}</style>
        </Modal>
      )}
    </>
  );
}