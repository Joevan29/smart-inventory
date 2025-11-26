import pool from '../lib/db';
import { auth, signOut } from '../auth'; 
import Search from './components/Search';
import Pagination from './components/Pagination';
import StockChart from './components/StockChart';
import { DataTable } from './components/table/data-table';
import { columns } from './components/table/columns';
import { 
  Plus, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  TrendingUp,
  Box,
  LayoutDashboard,
  Search as SearchIcon
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  stock: number;
  price: string;
  image_url: string;
  location?: string;
}

interface DashboardStats {
  total_sku: number;
  total_valuation: number;
  low_stock_alert: number;
}

async function getStats(): Promise<DashboardStats> {
  const res = await pool.query(`
    SELECT 
      COUNT(*) as total_sku, 
      SUM(stock * price) as total_valuation,
      SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as low_stock_alert
    FROM products
  `);
  return {
    total_sku: Number(res.rows[0].total_sku || 0),
    total_valuation: Number(res.rows[0].total_valuation || 0),
    low_stock_alert: Number(res.rows[0].low_stock_alert || 0),
  } as DashboardStats;
}

async function getChartData() {
  const res = await pool.query(`
    SELECT name, stock FROM products 
    ORDER BY stock DESC 
    LIMIT 5 -- UBAH JADI 5 AGAR GRAFIK TIDAK TERLALU PADAT
  `);
  return res.rows;
}

async function getProducts(query: string, currentPage: number): Promise<Product[]> {
  const ITEMS_PER_PAGE = 7;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let text = `SELECT * FROM products ORDER BY id DESC LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;
  let values: string[] = [];

  if (query) {
    text = `
      SELECT * FROM products 
      WHERE name ILIKE $1 OR sku ILIKE $1 
      ORDER BY id DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    values = [`%${query}%`];
  }

  const res = await pool.query(text, values);
  return res.rows;
}

async function getTotalPages(query: string): Promise<number> {
  const ITEMS_PER_PAGE = 7; // Samakan dengan diatas
  let text = 'SELECT COUNT(*) FROM products';
  let values: string[] = [];

  if (query) {
    text += ' WHERE name ILIKE $1 OR sku ILIKE $1';
    values = [`%${query}%`];
  }

  const res = await pool.query(text, values);
  const totalItems = Number(res.rows[0].count);
  return Math.ceil(totalItems / ITEMS_PER_PAGE);
}

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(value));
};

type Props = {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
};

export default async function Home(props: Props) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  
  const [products, totalPages, stats, chartData] = await Promise.all([
    getProducts(query, currentPage),
    getTotalPages(query),
    getStats(),
    getChartData()
  ]);

  return (
    <main className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-lg shadow-md">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">WMS Enterprise</h1>
              <p className="text-xs text-slate-500">Inventory Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>System Operational</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{session?.user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-white">
                {session?.user?.name?.charAt(0) || 'A'}
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-md transition-colors">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover group relative overflow-hidden col-span-1 md:col-span-2">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-100">
                  <TrendingUp className="w-3 h-3" /> +2.4%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Inventory Valuation</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(stats.total_valuation)}
                </h3>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm card-hover relative overflow-hidden">
            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="p-2 w-fit bg-blue-50 text-blue-600 rounded-xl border border-blue-100 mb-4">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Active SKU</p>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {stats.total_sku} <span className="text-sm font-medium text-slate-400">Items</span>
                </h3>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm card-hover relative overflow-hidden ${stats.low_stock_alert > 0 ? 'bg-white border-rose-200' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div className={`p-2 w-fit rounded-xl border mb-4 ${stats.low_stock_alert > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 ${stats.low_stock_alert > 0 ? 'text-rose-600' : 'text-slate-500'}`}>Low Stock Alerts</p>
                <h3 className={`text-2xl font-extrabold ${stats.low_stock_alert > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {stats.low_stock_alert} <span className="text-sm font-medium opacity-60">Items</span>
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex-1 w-full">
             <Search placeholder="Search products by Name, SKU..." />
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Link 
              href="/outbound" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              Bulk Outbound
            </Link>
            
            <Link 
              href="/add" 
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <section className="lg:col-span-2 space-y-4 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Inventory List</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                  Page {currentPage}
                </span>
              </div>
              <DataTable columns={columns} data={products} />
            </div>
            <div className="flex justify-center">
               <Pagination totalPages={totalPages} />
            </div>
          </section>

          {/* --- Analytics Chart (1/3 width) --- */}
          <section className="lg:col-span-1 space-y-6 min-w-0">
             {/* Chart Container */}
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <div className="mb-4">
                 <h3 className="font-bold text-slate-800">Inventory Overview</h3>
                 <p className="text-xs text-slate-500">Top products by available quantity</p>
               </div>
               
               <div className="h-[300px] w-full"> 
                 {chartData.length > 0 ? (
                   <StockChart data={chartData} />
                 ) : (
                   <div className="h-full flex items-center justify-center text-slate-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                     No data available for chart
                   </div>
                 )}
               </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                    <span className="bg-white/20 p-1 rounded">💡</span> Pro Tip
                  </h4>
                  <p className="text-indigo-100 text-xs leading-relaxed">
                    Gunakan fitur <strong>Bulk Outbound</strong> untuk memproses banyak pesanan sekaligus dan menghemat waktu operasional gudang Anda.
                  </p>
                </div>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
             </div>
          </section>
        </div>

      </div>
    </main>
  );
}