'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react';
import DeleteButton from '../DeleteButton';

// Tipe data sesuai database Anda
export type Product = {
  id: number;
  sku: string;
  name: string;
  stock: number;
  price: string;
  image_url: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
        {row.getValue('sku')}
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center hover:text-slate-900 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden border border-slate-200 relative">
             <img 
               src={row.original.image_url || 'https://placehold.co/100x100'} 
               alt={row.getValue('name')} 
               className="w-full h-full object-cover"
             />
          </div>
          <div>
            <div className="font-medium text-slate-900">{row.getValue('name')}</div>
            <div className="text-[10px] text-slate-500">ID: {row.original.id}</div>
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
      const isLow = stock < 10;
      
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          isLow 
            ? 'bg-red-50 text-red-700 border-red-200' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isLow && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>}
          {stock} Units
        </div>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Base Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(price);
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2">
          <Link 
            href={`/history/${product.id}`}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
            title="View History"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          
          <Link 
            href={`/edit/${product.id}`}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-500 hover:text-amber-600 transition-colors"
            title="Edit Product"
          >
            <Pencil className="w-4 h-4" />
          </Link>

          <div className="scale-75 origin-left">
             <DeleteButton id={product.id} productName={product.name} />
          </div>
        </div>
      );
    },
  },
];