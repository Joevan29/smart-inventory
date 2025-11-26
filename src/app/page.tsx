import pool from '../lib/db';
import Link from 'next/link';
import { auth, signOut } from '../auth'; 
import Search from './components/Search';
import Pagination from './components/Pagination';
import StockChart from './components/StockChart';
import { DataTable } from './components/table/data-table';
import { columns } from './components/table/columns';
import { Plus, DollarSign, Package, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  stock: number;
  price: string;
  image_url: string;
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
    LIMIT 10
  `);
  return res.rows;
}

async function getProducts(query: string, currentPage: number): Promise<Product[]> {
  const ITEMS_PER_PAGE = 10; 
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let text = `
    SELECT * FROM products 
    ORDER BY id DESC 
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `;
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
  const ITEMS_PER_PAGE = 10;
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
  searchParams?: {
    query?: string;
    page?: string;
  };
};

export default async function Home(props: Props) {
  const session = await auth();
  const searchParams = props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  
  const [products, totalPages, stats, chartData] = await Promise.all([
    getProducts(query, currentPage),
    getTotalPages(query),
    getStats(),
    getChartData()
  ]);
  
  const lowStockPercentage = Math.min((stats.low_stock_alert / (stats.total_sku || 1)) * 100, 100);

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WMS Enterprise Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Welcome back, <span className="font-medium text-slate-800">{session?.user?.name || 'Admin'}</span>
            </p>
          </div>
          
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 rounded-lg transition-all duration-200 border border-rose-100">
              Sign Out
            </button>
          </form>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-white to-emerald-50/50 p-6 rounded-xl shadow-sm border border-emerald-100/50 relative overflow-hidden group transition-all duration-300 hover:shadow-md">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-emerald-900/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Total Valuation
                </h3>
                <p className="text-3xl font-extrabold text-emerald-950 tracking-tight mt-2">
                  {formatCurrency(stats.total_valuation)}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-white/60 border border-emerald-100 w-fit px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <TrendingUp className="w-3 h-3" />
                  +2.5% growth
                </div>
              </div>
              <div className="p-3 bg-emerald-100/50 rounded-lg text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl group-hover:bg-emerald-200/40 transition-all"></div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-xl shadow-sm border border-blue-100/50 relative overflow-hidden group transition-all duration-300 hover:shadow-md">
             <div className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-blue-900/60 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Active SKU
                </h3>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                  {stats.total_sku}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Total unique items</p>
              </div>
              <div className="p-3 bg-blue-100/50 rounded-lg text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl group-hover:bg-blue-200/40 transition-all"></div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden transition-all duration-300 hover:shadow-md ${stats.low_stock_alert > 0 ? 'bg-gradient-to-br from-white to-rose-50/80 border-rose-200' : 'bg-white border-slate-200'}`}>
            <div className="relative z-10 flex justify-between items-start">
              <div className="w-full">
                <h3 className={`${stats.low_stock_alert > 0 ? 'text-rose-700' : 'text-slate-500'} text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1`}>
                  <AlertTriangle className="w-3 h-3" /> Low Stock Alert
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className={`text-3xl font-extrabold tracking-tight ${stats.low_stock_alert > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                    {stats.low_stock_alert}
                  </p>
                  <span className="text-sm font-medium text-slate-500">Items need attention</span>
                </div>
                
                {stats.low_stock_alert > 0 && (
                  <div className="mt-4 w-full bg-rose-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${lowStockPercentage}%` }}
                    ></div>
                  </div>
                )}
              </div>
              {stats.low_stock_alert > 0 && (
                <div className="p-3 bg-rose-100/50 rounded-lg text-rose-600 group-hover:animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        </section>
        
        <section className="flex justify-start pt-2">
            <Link 
              href="/outbound" 
              className="inline-flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition-all shadow-sm active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              Fulfill Outbound Orders (Bulk)
            </Link>
        </section>

        {!query && chartData.length > 0 && (
          <section>
            <StockChart data={chartData} />
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-full max-w-md">
              <Search placeholder="Search by SKU, Product Name..." />
            </div>
            <Link 
              href="/add" 
              className="w-full sm:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Register New SKU
            </Link>
          </div>

          <DataTable columns={columns} data={products} />

          <div className="flex justify-end pt-4">
            <Pagination totalPages={totalPages} />
          </div>
        </section>

      </div>
    </main>
  );
}