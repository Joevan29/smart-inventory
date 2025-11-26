'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { ArrowUpDown, Eye, Pencil, MapPin } from 'lucide-react';
import DeleteButton from '../DeleteButton';
import StockActionCell from './StockActionCell';

export type Product = {
  id: number;
  sku: string;
  name: string;
  stock: number;
  price: string;
  image_url: string;
  location?: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name', 
    header: 'Product Info',
    cell: ({ row }) => {
      const name = row.original.name || 'Unknown Product'; 
      const sku = row.original.sku || '-';
      const imageUrl = row.original.image_url;
      const location = row.original.location;
      
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      return (
        <div className="flex items-start gap-3 py-2">
          {/* Gambar */}
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 relative flex-shrink-0 bg-slate-50 mt-1">
             {!imageUrl || imageUrl.includes('placehold.co') ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                  {initials}
                </div>
             ) : (
               <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
             )}
          </div>
          
          {/* Info Detail */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-800 text-sm leading-tight">{name}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 rounded tracking-wide">
                {sku}
              </span>
              
              {/* Badge Lokasi */}
              {location ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 rounded">
                  <MapPin className="w-2.5 h-2.5" />
                  {location}
                </span>
              ) : (
                <span className="text-[10px] text-slate-300 italic">No Loc</span>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'stock',
    header: 'Level',
    cell: ({ row }) => {
      const stock = parseInt(row.getValue('stock'));
      
      let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
      if (stock === 0) badgeStyle = "bg-rose-50 text-rose-600 border-rose-100";
      else if (stock < 10) badgeStyle = "bg-amber-50 text-amber-600 border-amber-100";
      else if (stock > 100) badgeStyle = "bg-emerald-50 text-emerald-600 border-emerald-100";
      
      return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${badgeStyle}`}>
          {stock < 10 && stock > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>}
          {stock}
        </div>
      );
    },
  },
  {
    id: 'quick_stock',
    header: 'Quick Actions',
    cell: ({ row }) => <StockActionCell product={row.original} />,
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return (
        <span className="font-mono text-xs text-slate-600 font-medium">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <Link 
            href={`/history/${product.id}`}
            className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
            title="History"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <Link 
            href={`/edit/${product.id}`}
            className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>
          <div className="scale-90">
             <DeleteButton id={product.id} productName={product.name} />
          </div>
        </div>
      );
    },
  },
];