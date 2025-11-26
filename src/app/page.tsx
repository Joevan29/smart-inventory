import pool from '@/src/lib/db';
import Link from 'next/link';
import { auth, signOut } from '@/src/auth';
import Search from './components/Search';
import Pagination from './components/Pagination';
import StockChart from './components/StockChart';
import TransactionForm from './components/TransactionForm';

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
  return res.rows[0] as DashboardStats;
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
  const ITEMS_PER_PAGE = 5;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let text = `
    SELECT * FROM products 
    ORDER BY id ASC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `;
  let values: string[] = [];

  if (query) {
    text = `
      SELECT * FROM products 
      WHERE name ILIKE $1 OR sku ILIKE $1 
      ORDER BY id ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    values = [`%${query}%`];
  }

  const res = await pool.query(text, values);
  return res.rows;
}

// 4. Menghitung Total Halaman untuk Pagination
async function getTotalPages(query: string): Promise<number> {
  const ITEMS_PER_PAGE = 5;
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
  searchParams?: Promise<{
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
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WMS Enterprise Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-medium text-slate-800">{session?.user?.name || 'Admin'}</span>
            </p>
          </div>
          
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 rounded-lg transition-all duration-200">
              Sign Out
            </button>
          </form>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="relative z-10">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Asset Valuation</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
                {formatCurrency(stats.total_valuation || 0)}
              </p>
              <span className="text-xs text-emerald-600 flex items-center gap-1 mt-2 font-medium bg-emerald-50 w-fit px-2 py-1 rounded">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Real-time Calculation
              </span>
            </div>
            <div className="absolute right-0 top-0 h-full w-1.5 bg-emerald-500 group-hover:w-2 transition-all"></div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
             <div className="relative z-10">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total SKU Registered</h3>
              <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
                {stats.total_sku} <span className="text-base font-normal text-slate-400">Items</span>
              </p>
              <span className="text-xs text-blue-600 mt-2 font-medium bg-blue-50 w-fit px-2 py-1 rounded inline-block">
                Active Inventory
              </span>
            </div>
            <div className="absolute right-0 top-0 h-full w-1.5 bg-blue-500 group-hover:w-2 transition-all"></div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden group hover:shadow-md transition-all duration-300 ${Number(stats.low_stock_alert) > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'}`}>
            <div className="relative z-10">
              <h3 className={`${Number(stats.low_stock_alert) > 0 ? 'text-red-600' : 'text-slate-500'} text-xs font-bold uppercase tracking-wider`}>
                Low Stock Alert
              </h3>
              <p className={`text-3xl font-extrabold mt-3 tracking-tight ${Number(stats.low_stock_alert) > 0 ? 'text-red-700' : 'text-slate-900'}`}>
                {stats.low_stock_alert} <span className="text-base font-normal opacity-70">Items</span>
              </p>
              <span className={`text-xs mt-2 font-medium px-2 py-1 rounded inline-block ${Number(stats.low_stock_alert) > 0 ? 'text-red-700 bg-red-100' : 'text-slate-500 bg-slate-100'}`}>
                {Number(stats.low_stock_alert) > 0 ? 'Action Required' : 'Healthy Level'}
              </span>
            </div>
             <div className={`absolute right-0 top-0 h-full w-1.5 group-hover:w-2 transition-all ${Number(stats.low_stock_alert) > 0 ? 'bg-red-500' : 'bg-slate-300'}`}></div>
          </div>
        </section>

        {!query && chartData.length > 0 && (
          <section>
            <StockChart data={chartData} />
          </section>
        )}

        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="w-full max-w-md">
              <Search placeholder="Search by Product Name or SKU..." />
            </div>
            <Link href="/add" className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              Register New SKU
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {products.length === 0 ? (
               <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-slate-200">
                 <div className="text-slate-300 mb-3">
                   <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 </div>
                 <p className="text-slate-500 font-medium">No products found matching &quot;{query}&quot;.</p>
                 {query && (
                   <Link href="/" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Clear search</Link>
                 )}
               </div>
            ) : (
              products.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-blue-300 transition-colors duration-200">
                  
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden border border-slate-100 relative">
                     <img 
                       src={item.image_url || 'https://placehold.co/600x400?text=No+Image'} 
                       alt={item.name} 
                       className="w-full h-full object-cover opacity-95 hover:opacity-100 transition-opacity" 
                     />
                  </div>

                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                      <div className="group">
                        <Link href={`/history/${item.id}`} className="block">
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors truncate pr-4">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-0.5 rounded border border-slate-200">
                            {item.sku}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <p className="text-xs text-slate-500 font-medium">
                            Base Price: {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right flex-shrink-0 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Available Stock</span>
                        <span className={`block text-2xl font-extrabold tabular-nums ${item.stock < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.stock}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 border-t border-slate-100">
                      <div className="flex-1">
                        <TransactionForm productId={item.id} type="IN" />
                      </div>
                      
                      <div className="hidden sm:block w-px bg-slate-200 my-1"></div>

                      <div className="flex-1">
                        <TransactionForm productId={item.id} type="OUT" />
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <Pagination totalPages={totalPages} />
          </div>
        </section>

      </div>
    </main>
  );
}