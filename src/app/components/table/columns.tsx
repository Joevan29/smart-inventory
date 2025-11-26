'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Eye, Pencil, MapPin } from 'lucide-react';
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

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-red-100 text-red-700 border-red-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-rose-100 text-rose-700 border-rose-200',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
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

      const colorClass = getAvatarColor(name);

      return (
        <div className="flex items-start gap-3 py-1">
          <div className={`w-10 h-10 rounded-xl overflow-hidden border relative flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold shadow-sm ${!imageUrl || imageUrl.includes('placehold.co') ? colorClass : 'border-slate-200'}`}>
             {!imageUrl || imageUrl.includes('placehold.co') ? (
                <span>{initials}</span>
             ) : (
               <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
             )}
          </div>
          
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm leading-tight hover:text-slate-600 transition-colors cursor-default">
              {name}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {sku}
              </span>
              
              {location && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-500">
                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock Level',
    cell: ({ row }) => {
      const stock = parseInt(row.getValue('stock'));
      
      let badgeClass = "bg-slate-100 text-slate-600 border-slate-200";
      let statusText = "Good";
      
      if (stock === 0) {
        badgeClass = "bg-rose-50 text-rose-600 border-rose-200";
        statusText = "Out of Stock";
      }
      else if (stock < 10) {
        badgeClass = "bg-amber-50 text-amber-600 border-amber-200";
        statusText = "Low Stock";
      }
      else if (stock > 100) {
        badgeClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
        statusText = "In Stock";
      }
      
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">{stock}</span>
            <span className="text-[10px] text-slate-400 font-medium">Units</span>
          </div>
          <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
            {statusText}
          </span>
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
    header: 'Base Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return (
        <span className="font-mono text-sm text-slate-600 font-bold tracking-tight">
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
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link 
            href={`/history/${product.id}`}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="View History"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link 
            href={`/edit/${product.id}`}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            title="Edit Product"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <DeleteButton id={product.id} productName={product.name} />
        </div>
      );
    },
  },
];