'use client';

import { useState } from 'react';
import { Package, MapPin, Info, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  sku: string;
  stock: number;
  location?: string;
}

interface Props {
  products: Product[];
}

export default function WarehouseMap({ products }: Props) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const zones = products.reduce((acc, product) => {
    const loc = product.location ? product.location.trim().toUpperCase() : 'UNASSIGNED';
    const zoneCode = loc === 'UNASSIGNED' ? 'UNASSIGNED' : loc.charAt(0);
    
    if (!acc[zoneCode]) {
      acc[zoneCode] = [];
    }
    acc[zoneCode].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const zoneKeys = Object.keys(zones).sort();

  return (
    <div className="space-y-6">
      {/* --- Map Grid --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {zoneKeys.map((zone) => {
          const itemCount = zones[zone].length;
          const totalStock = zones[zone].reduce((sum, p) => sum + p.stock, 0);
          const hasLowStock = zones[zone].some(p => p.stock < 10);
          const isSelected = selectedZone === zone;

          return (
            <div 
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`
                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-[1.02]' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                }
                ${zone === 'UNASSIGNED' ? 'border-dashed bg-slate-50' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm
                  ${zone === 'UNASSIGNED' ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white'}
                `}>
                  {zone === 'UNASSIGNED' ? '?' : zone}
                </div>
                {hasLowStock && (
                  <div className="animate-pulse" title="Zone contains low stock items">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {zone === 'UNASSIGNED' ? 'Unallocated' : `Zone ${zone}`}
                </h4>
                <p className="text-2xl font-black text-slate-900">{itemCount} <span className="text-sm font-medium text-slate-500">SKUs</span></p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Total Items: {totalStock}</p>
              </div>

              {/* Decorative Pattern */}
              <div className="absolute bottom-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <MapPin className="w-12 h-12" />
              </div>
            </div>
          );
        })}
      </div>

      {selectedZone && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Items in {selectedZone === 'UNASSIGNED' ? 'Unassigned Area' : `Zone ${selectedZone}`}
            </h3>
            <button onClick={() => setSelectedZone(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700">
              Close View
            </button>
          </div>
          
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
            {zones[selectedZone].map((product) => (
              <div key={product.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group">
                <div className={`w-2 h-full rounded-full flex-shrink-0 ${product.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mb-2">{product.sku}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {product.location || 'No Loc'}
                    </span>
                    <span className={`text-sm font-bold ${product.stock < 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {product.stock} <span className="text-[10px] font-normal text-slate-400">qty</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!selectedZone && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm font-medium">Select a zone above to view inventory details</p>
        </div>
      )}
    </div>
  );
}