'use client';

import { useState, useMemo, useCallback } from 'react';
import { Package, X, MapPin, Loader2, ArrowUpRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { searchProducts, processBulkTransaction } from '../actions'; 

interface Product {
  id: number;
  sku: string;
  name: string;
  stock: number;
  location?: string;
  price: string;
  image_url: string;
}

interface OrderItem extends Product {
  quantityToProcess: number;
}

export default function BulkTransactionTable({ type = 'OUT' }: { type: 'IN' | 'OUT' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Gagal mencari produk.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAddItem = (product: Product) => {
    if (orderItems.some(item => item.id === product.id)) {
      toast.warning(`${product.name} sudah ada di daftar.`);
      return;
    }

    setOrderItems(prev => [
      ...prev,
      { ...product, quantityToProcess: 1 }
    ]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleUpdateQuantity = (productId: number, newQty: number) => {
    if (newQty < 1) newQty = 1;
    
    setOrderItems(prev => prev.map(item => 
      item.id === productId ? { ...item, quantityToProcess: newQty } : item
    ));
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Daftar order kosong.');
      return;
    }
    
    const isOverStock = orderItems.find(item => type === 'OUT' && item.quantityToProcess > item.stock);
    if (isOverStock) {
        toast.error(`Stock ${isOverStock.name} tidak cukup (${isOverStock.stock} tersedia).`);
        return;
    }
    
    setIsProcessing(true);
    
    try {
      const payload = orderItems.map(item => ({
        id: item.id,
        quantity: item.quantityToProcess
      }));

      const result = await processBulkTransaction(payload, type);

      if (result.success) {
        toast.success(result.message);
        setOrderItems([]); 
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalQuantity = useMemo(() => 
    orderItems.reduce((sum, item) => sum + item.quantityToProcess, 0), 
    [orderItems]
  );
  
  const headerStyle = type === 'OUT' 
    ? 'bg-rose-600 text-white' 
    : 'bg-emerald-600 text-white';

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="w-full relative">
        <input
          type="text"
          placeholder={`Search Product by SKU/Name to add to ${type === 'OUT' ? 'Outbound' : 'Inbound'} list...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {isSearching && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
           </div>
        )}
      </div>

      <div className="relative">
        {searchTerm.length >= 2 && searchResults.length > 0 && (
          <div className="absolute z-50 w-full max-w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map(product => (
              <div 
                key={product.id} 
                onClick={() => handleAddItem(product)}
                className="flex justify-between items-center p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
              >
                <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-800">{product.name}</span>
                    <div className="flex gap-2 text-xs text-slate-500">
                        <span className="font-mono">SKU: {product.sku}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {product.location || 'N/A'}</span>
                    </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${product.stock < 10 ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-600'}`}>
                    Stock: {product.stock}
                </span>
              </div>
            ))}
          </div>
        )}
        {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
           <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-slate-500 text-sm">
             Product not found.
           </div>
        )}
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className={`p-4 font-bold text-lg ${headerStyle} flex justify-between items-center`}>
            <span>{type === 'OUT' ? 'Outbound Order List' : 'Inbound Receipt List'}</span>
            <span className="text-sm font-medium opacity-80">{orderItems.length} Items</span>
        </div>
        
        <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-3 text-left whitespace-nowrap">Product (SKU)</th>
                        <th className="px-6 py-3 text-left whitespace-nowrap">Location</th>
                        <th className="px-6 py-3 text-center whitespace-nowrap">Current Stock</th>
                        <th className="px-6 py-3 text-center whitespace-nowrap">Qty to Process</th>
                        <th className="px-6 py-3 text-right whitespace-nowrap">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orderItems.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                Use the search bar above to add items to the order.
                            </td>
                        </tr>
                    ) : (
                        orderItems.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                    {item.name}
                                    <span className="block text-[10px] text-slate-400 font-mono">{item.sku}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                                        {item.location || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600 font-medium text-sm whitespace-nowrap">{item.stock}</td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <input 
                                        type="number" 
                                        min="1"
                                        max={type === 'OUT' ? item.stock : undefined}
                                        value={item.quantityToProcess}
                                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                        className={`w-20 text-center border p-1 rounded-lg text-sm font-bold ${
                                            (type === 'OUT' && item.quantityToProcess > item.stock) ? 'border-rose-500 text-rose-600 focus:ring-rose-500' : 'border-slate-300 text-slate-800 focus:ring-slate-900'
                                        } focus:ring-2 outline-none`}
                                    />
                                     {type === 'OUT' && item.quantityToProcess > item.stock && (
                                        <p className="text-[10px] text-rose-500 font-bold mt-1">Over Stock!</p>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button 
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <div className="w-full max-w-sm space-y-3">
          <div className="flex justify-between items-center px-4 py-2 bg-slate-100 rounded-lg">
            <span className="font-bold text-slate-700 uppercase text-sm">Total Quantity</span>
            <span className="text-xl font-extrabold text-slate-900">{totalQuantity} Units</span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={orderItems.length === 0 || isProcessing || (type === 'OUT' && orderItems.some(item => item.quantityToProcess > item.stock))}
            className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 
              ${headerStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5" /> Confirm {type === 'OUT' ? 'Outbound Order' : 'Inbound Receipt'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}