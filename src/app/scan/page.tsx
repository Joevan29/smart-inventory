'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { getProductBySku } from '../actions';
import Link from 'next/link';
import { ArrowLeft, ScanLine, AlertCircle } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import { toast } from 'sonner';

interface ScannedProduct {
  id: number;
  sku: string;
  name: string;
  stock: number;
  price: string;
  location?: string;
}

export default function ScanPage() {
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (result: any) => {
    if (!result) return;
    
    const rawValue = result[0]?.rawValue;
    if (!rawValue) return;

    setIsScanning(false);
    
    toast.info(`Processing SKU: ${rawValue}...`);

    const product = await getProductBySku(rawValue);

    if (product) {
      setScannedProduct(product);
      toast.success('Product Found!');
    } else {
      setErrorMsg(`SKU "${rawValue}" tidak ditemukan di database.`);
      setScannedProduct(null);
    }
  };

  const resetScan = () => {
    setScannedProduct(null);
    setErrorMsg('');
    setIsScanning(true);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-emerald-400" />
          Smart Scanner
        </h1>
        <div className="w-9"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-6">
        
        {!scannedProduct && (
          <div className="w-full aspect-square bg-black rounded-3xl overflow-hidden relative border-2 border-slate-700 shadow-2xl">
            {isScanning ? (
              <>
                <Scanner 
                  onScan={handleScan}
                  allowMultiple={true}
                  scanDelay={2000}
                  components={{
                    audio: false,
                    onOff: true,
                    torch: true,
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' }
                  }}
                />
                <div className="absolute inset-0 border-[40px] border-black/50 z-10 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-emerald-500 rounded-lg z-20 opacity-50 animate-pulse"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500 z-20 animate-[ping_2s_ease-in-out_infinite]"></div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Processing...
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl text-rose-200 text-sm flex items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Gagal Identifikasi</p>
              <p className="text-xs opacity-80">{errorMsg}</p>
            </div>
            <button onClick={resetScan} className="text-xs bg-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-500">
              Try Again
            </button>
          </div>
        )}

        {scannedProduct && (
          <div className="bg-white text-slate-900 p-6 rounded-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                  Detected
                </span>
                <h2 className="text-xl font-extrabold mt-2 leading-tight">{scannedProduct.name}</h2>
                <p className="font-mono text-sm text-slate-500">{scannedProduct.sku}</p>
              </div>
              <button onClick={resetScan} className="text-xs text-slate-400 hover:text-rose-500 underline">
                Scan Other
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl mb-6 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Current Stock</span>
                <span className="text-2xl font-black text-slate-900">{scannedProduct.stock}</span>
            </div>

            <div className="transaction-form-wrapper">
               <TransactionForm productId={scannedProduct.id} stock={scannedProduct.stock} />
            </div>
          </div>
        )}

        {!scannedProduct && !errorMsg && (
          <p className="text-slate-400 text-xs text-center max-w-xs">
            Arahkan kamera ke QR Code pada label produk untuk melakukan Stok Opname atau transaksi cepat.
          </p>
        )}

      </div>
    </main>
  );
}