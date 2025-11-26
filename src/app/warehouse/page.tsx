import pool from '@/src/lib/db';
import Link from 'next/link';
import { ArrowLeft, Map } from 'lucide-react';
import WarehouseMap from '../components/WarehouseMap';
import FadeIn from '../components/FadeIn';

interface Product {
  id: number;
  sku: string;
  name: string;
  stock: number;
  location?: string;
}

async function getAllProducts() {
  const res = await pool.query('SELECT id, sku, name, stock, location FROM products ORDER BY location ASC');
  return res.rows as Product[];
}

export default async function WarehousePage() {
  const products = await getAllProducts();

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <FadeIn delay={0}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Map className="w-6 h-6 text-indigo-600" />
                  Warehouse Layout
                </h1>
                <p className="text-sm text-slate-500">Visual representation of inventory zones</p>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Items Tracked</p>
              <p className="text-2xl font-black text-slate-900">{products.length}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
           <WarehouseMap products={products} />
        </FadeIn>

      </div>
    </main>
  );
}