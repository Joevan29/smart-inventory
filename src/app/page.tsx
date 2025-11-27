import pool from '../lib/db';
import { auth, signOut } from '../auth';
import Search from './components/Search';
import Pagination from './components/Pagination';
import StockChart from './components/StockChart';
import { DataTable } from './components/table/data-table';
import { columns } from './components/table/columns';
import FadeIn from './components/FadeIn';
import LocationFilter from './components/LocationFilter';
import { getRestockPrediction } from './actions';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  DollarSign,
  Activity,
  Calendar,
  MapPin,
  Truck,
  User,
  Settings,
  LogOut,
  Zap,
  RefreshCw,
  Search as SearchIcon,
  ArrowUpRight,
  ArrowDownLeft,
  ScanLine,
  Lightbulb,
  Box,
  Layers,
  BarChart3,
  PieChart,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  stock: number;
  price: string;
  image_url: string;
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface FinancialStats {
  total_valuation: number;
  potential_revenue: number;
  avg_item_price: number;
  highest_value_item: { name: string; price: number };
  total_items_count: number;
}

interface InventoryHealthStats {
  total_sku: number;
  low_stock_count: number;
  out_of_stock_count: number;
  healthy_stock_count: number;
  overstock_count: number;
  stock_utilization: number;
}

interface ZoneStats {
  zone: string;
  sku_count: number;
  total_items: number;
  valuation: number;
}

interface ActivityLog {
  id: number;
  type: 'IN' | 'OUT';
  product_name: string;
  sku: string;
  quantity: number;
  notes: string;
  created_at: Date;
  ending_stock: number;
}

interface PredictionResult {
  product_id: number;
  product_name: string;
  sku: string;
  current_stock: number;
  location: string;
  prediction_qty: number;
  days_to_empty: number;
}

async function getUniqueLocations(): Promise<string[]> {
  try {
    const res = await pool.query(`
      SELECT DISTINCT SUBSTRING(location FROM 1 FOR 1) as zone
      FROM products
      WHERE location IS NOT NULL AND location != ''
      ORDER BY zone ASC
    `);
    return res.rows.map(row => row.zone).filter(zone => /^[A-Z0-9]$/i.test(zone));
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

async function getFinancialStats(): Promise<FinancialStats> {
  const res = await pool.query(`
    SELECT 
      SUM(stock * price) as total_valuation,
      AVG(price) as avg_price,
      SUM(stock) as total_items,
      (SELECT name FROM products ORDER BY price DESC LIMIT 1) as expensive_name,
      (SELECT price FROM products ORDER BY price DESC LIMIT 1) as expensive_price
    FROM products
  `);
  
  const data = res.rows[0];
  const valuation = Number(data.total_valuation || 0);
  
  const potential_revenue = valuation * 1.35;

  return {
    total_valuation: valuation,
    potential_revenue: potential_revenue,
    avg_item_price: Number(data.avg_price || 0),
    total_items_count: Number(data.total_items || 0),
    highest_value_item: {
      name: data.expensive_name || 'N/A',
      price: Number(data.expensive_price || 0)
    }
  };
}

async function getInventoryHealth(): Promise<InventoryHealthStats> {
  const res = await pool.query(`
    SELECT 
      COUNT(*) as total_sku,
      SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN stock > 0 AND stock < 10 THEN 1 ELSE 0 END) as low_stock,
      SUM(CASE WHEN stock >= 10 AND stock <= 500 THEN 1 ELSE 0 END) as healthy_stock,
      SUM(CASE WHEN stock > 500 THEN 1 ELSE 0 END) as overstock
    FROM products
  `);

  const data = res.rows[0];
  const totalSku = Number(data.total_sku || 0);
  const activeSku = totalSku - Number(data.out_of_stock || 0);
  
  return {
    total_sku: totalSku,
    out_of_stock_count: Number(data.out_of_stock || 0),
    low_stock_count: Number(data.low_stock || 0),
    healthy_stock_count: Number(data.healthy_stock || 0),
    overstock_count: Number(data.overstock || 0),
    stock_utilization: totalSku > 0 ? (activeSku / totalSku) * 100 : 0
  };
}

async function getZoneAnalytics(): Promise<ZoneStats[]> {
  const res = await pool.query(`
    SELECT 
      SUBSTRING(location FROM 1 FOR 1) as zone,
      COUNT(id) as sku_count,
      SUM(stock) as total_items,
      SUM(stock * price) as valuation
    FROM products
    WHERE location IS NOT NULL AND location != ''
    GROUP BY SUBSTRING(location FROM 1 FOR 1)
    ORDER BY zone ASC
  `);

  return res.rows.map(row => ({
    zone: row.zone || 'Unassigned',
    sku_count: Number(row.sku_count),
    total_items: Number(row.total_items),
    valuation: Number(row.valuation)
  }));
}

async function getChartData() {
  const res = await pool.query(`
    SELECT name, stock FROM products 
    ORDER BY stock DESC 
    LIMIT 7
  `);
  return res.rows;
}

async function getRecentActivities(): Promise<ActivityLog[]> {
  const res = await pool.query(`
    SELECT 
      sm.id, sm.type, sm.quantity, sm.notes, sm.created_at, sm.ending_stock,
      p.name as product_name, p.sku
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    ORDER BY sm.created_at DESC
    LIMIT 6
  `);
  return res.rows;
}

async function getProducts(query: string, currentPage: number, location: string): Promise<Product[]> {
  const ITEMS_PER_PAGE = 8; 
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
  let text = `SELECT * FROM products`;
  let conditions: string[] = [];
  let values: (string | number)[] = [];

  if (query) {
    values.push(`%${query}%`);
    conditions.push(`(name ILIKE $${values.length} OR sku ILIKE $${values.length})`);
  }
  
  if (location) {
    values.push(`${location}%`);
    conditions.push(`location ILIKE $${values.length}`);
  }
  
  if (conditions.length > 0) {
    text += ` WHERE ` + conditions.join(' AND ');
  }

  text += ` ORDER BY id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(ITEMS_PER_PAGE, offset);

  const res = await pool.query(text, values);
  return res.rows;
}

async function getTotalPages(query: string, location: string): Promise<number> {
  const ITEMS_PER_PAGE = 8;
  let text = 'SELECT COUNT(*) FROM products';
  let conditions: string[] = [];
  let values: string[] = [];

  if (query) {
    values.push(`%${query}%`);
    conditions.push(`(name ILIKE $${values.length} OR sku ILIKE $${values.length})`);
  }

  if (location) {
    values.push(`${location}%`);
    conditions.push(`location ILIKE $${values.length}`);
  }

  if (conditions.length > 0) {
    text += ' WHERE ' + conditions.join(' AND ');
  }

  const res = await pool.query(text, values);
  const totalItems = Number(res.rows[0].count);
  return Math.ceil(totalItems / ITEMS_PER_PAGE);
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const timeAgo = (date: Date) => {
  const diff = new Date().getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
};

function DashboardHeader({ user }: { user: any }) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 transition-all duration-200 shadow-sm">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg shadow-slate-900/20 group cursor-pointer hover:scale-105 transition-transform">
            <LayoutDashboard className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">WMS <span className="font-light text-slate-500">Enterprise</span></h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Inventory Command Center</p>
          </div>
        </div>

        {/* Right: Actions, Date, Profile */}
        <div className="flex items-center gap-3 md:gap-5">
          
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-800">{user?.name || 'Administrator'}</p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-emerald-600 font-bold">System Online</p>
              </div>
            </div>
            
            <Link href="/settings" className="relative group">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-slate-600 group-hover:border-indigo-200 transition-all shadow-sm overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                )}
              </div>
            </Link>

            <form action={async () => { "use server"; await signOut(); }}>
              <button 
                className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100" 
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass, 
  trend,
  trendDirection = 'up'
}: { 
  title: string, 
  value: string | number, 
  subtitle: string, 
  icon: any, 
  colorClass: 'emerald' | 'blue' | 'rose' | 'amber' | 'violet',
  trend?: string,
  trendDirection?: 'up' | 'down'
}) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', glow: 'bg-emerald-400' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', glow: 'bg-blue-400' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', glow: 'bg-rose-400' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', glow: 'bg-amber-400' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', glow: 'bg-violet-400' },
  };

  const colors = colorMap[colorClass];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl border ${colors.bg} ${colors.text} ${colors.border} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${
            trendDirection === 'up' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1.5">{subtitle}</p>
      </div>

      <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500 ${colors.glow}`}></div>
    </div>
  );
}

function QuickInsightBanner({ stats, predictions }: { stats: InventoryHealthStats, predictions: PredictionResult[] }) {
  const criticalCount = predictions.filter(p => p.days_to_empty < 7).length;
  const systemStatus = stats.out_of_stock_count === 0 ? "Optimal" : "Attention Needed";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
      <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className={`w-4 h-4 ${stats.out_of_stock_count === 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Health</span>
          </div>
          <p className="font-black text-lg tracking-wide">{systemStatus}</p>
          <p className="text-xs text-slate-400 mt-1">{stats.stock_utilization.toFixed(1)}% SKU Utilization</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center relative z-10 border border-white/10 group-hover:bg-white/10 transition-colors">
          <div className={`w-3 h-3 rounded-full ${stats.out_of_stock_count > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-white/5 to-transparent skew-x-12"></div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden md:col-span-2 group">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 relative z-10">
          <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
            <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
              AI Demand Forecasting
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded text-white font-mono border border-white/10">BETA v2.0</span>
            </h4>
            <p className="text-sm text-indigo-100 opacity-90 leading-relaxed max-w-xl">
              {criticalCount > 0 
                ? `Peringatan: ${criticalCount} produk diprediksi akan habis dalam < 7 hari berdasarkan tren. Disarankan segera restock.`
                : "Analisis tren menunjukkan stabilitas stok yang baik untuk 30 hari ke depan. Tidak ada anomali terdeteksi."}
            </p>
          </div>
          <Link 
            href="/outbound"
            className="px-5 py-3 bg-white text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 whitespace-nowrap flex items-center gap-2"
          >
            Review Prediction <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-all duration-700"></div>
      </div>
    </div>
  );
}

type Props = {
  searchParams: Promise<{
    query?: string;
    page?: string;
    location?: string;
  }>;
};

export default async function Home(props: Props) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const locationFilter = searchParams?.location || '';
  const [
    products,
    totalPages,
    financeStats,
    healthStats,
    zoneStats,
    chartData,
    recentActivities,
    uniqueLocations,
    restockRecommendations
  ] = await Promise.all([
    getProducts(query, currentPage, locationFilter),
    getTotalPages(query, locationFilter),
    getFinancialStats(),
    getInventoryHealth(),
    getZoneAnalytics(),
    getChartData(),
    getRecentActivities(),
    getUniqueLocations(), 
    getRestockPrediction() 
  ]);

  return (
    <main className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      
      <DashboardHeader user={session?.user} />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 space-y-8">

        <FadeIn delay={0}>
          <QuickInsightBanner stats={healthStats} predictions={restockRecommendations} />
        </FadeIn>

        <FadeIn delay={100}>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard 
              title="Valuation" 
              value={formatCurrency(financeStats.total_valuation)} 
              subtitle="Total Assets Value" 
              icon={DollarSign} 
              colorClass="emerald"
              trend="+12.5%"
              trendDirection="up"
            />
            <StatCard 
              title="Potential Rev" 
              value={formatCurrency(financeStats.potential_revenue)} 
              subtitle="Estimated Revenue" 
              icon={BarChart3} 
              colorClass="violet"
              trend="+8.2%"
              trendDirection="up"
            />
            <StatCard 
              title="Stock Alerts" 
              value={formatNumber(healthStats.low_stock_count + healthStats.out_of_stock_count)} 
              subtitle="Critical Items" 
              icon={AlertTriangle} 
              colorClass={healthStats.out_of_stock_count > 0 ? "rose" : "amber"}
              trend={healthStats.out_of_stock_count > 0 ? "+2 New" : "Stable"}
              trendDirection={healthStats.out_of_stock_count > 0 ? "down" : "up"}
            />
            
            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col justify-center gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black z-0"></div>
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shortcut</p>
                  <Settings className="w-3 h-3 text-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/add" className="flex flex-col items-center justify-center p-3.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/5 transition-all text-white group/btn">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg mb-2 group-hover/btn:scale-110 transition-transform">
                      <Box className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold">New SKU</span>
                  </Link>
                  <Link href="/scan" className="flex flex-col items-center justify-center p-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl border border-indigo-500 transition-all text-white group/btn shadow-lg shadow-indigo-900/50">
                    <div className="p-1.5 bg-white/20 rounded-lg mb-2 group-hover/btn:scale-110 transition-transform">
                      <ScanLine className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold">Scan QR</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          <section className="xl:col-span-2 space-y-8 min-w-0">
            
            <FadeIn delay={200}>
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Search placeholder="Search inventory by Name, SKU, Description..." />
                </div>
                <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
                  {uniqueLocations.length > 0 && <LocationFilter locations={uniqueLocations} />}
                  <Link 
                    href="/outbound" 
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-transparent transition-all shadow-md shadow-slate-900/10 active:scale-95 whitespace-nowrap"
                  >
                    <Truck className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Bulk Outbound</span>
                  </Link>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-500" />
                      Live Inventory Database
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Showing <strong className="text-slate-900">{products.length}</strong> items from total <strong className="text-slate-900">{healthStats.total_sku}</strong> SKUs
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      Page {currentPage} of {Math.ceil(healthStats.total_sku / 8)}
                    </span>
                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="min-h-[400px]">
                  <DataTable columns={columns} data={products} />
                </div>
                
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                  <Pagination totalPages={totalPages} />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-500" /> Zone Distribution
                    </h3>
                    <Link href="/warehouse" className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors">
                      Map View
                    </Link>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {zoneStats.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">No zone data available.</div>
                    ) : (
                      zoneStats.slice(0, 4).map((zone) => (
                        <div key={zone.zone} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shadow-sm">
                              {zone.zone}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{zone.total_items} Items</p>
                              <p className="text-[10px] text-slate-500">{zone.sku_count} SKU Types</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-900">{formatNumber(zone.valuation / 1000000)}M</p>
                            <p className="text-[10px] text-slate-400">Est. Value</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-emerald-500" /> Stock Volume (Top 7)
                    </h3>
                  </div>
                  <div className="flex-1 min-h-[220px] w-full">
                    {chartData.length > 0 ? (
                      <StockChart data={chartData} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                        No data available for chart
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          </section>

          <section className="xl:col-span-1 space-y-6 min-w-0">
            
            <FadeIn delay={500}>
              <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-lg shadow-indigo-100/50 hover:shadow-xl transition-shadow duration-300">
                
                <div className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-5 border-b border-indigo-100 flex justify-between items-center relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600 animate-pulse" />
                    Smart Restock
                  </h3>
                  <button className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-1 rounded-md border border-indigo-200 hover:bg-indigo-50 flex items-center gap-1 transition-colors shadow-sm">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {restockRecommendations.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Inventory levels are healthy.</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">AI did not detect any stock-out risk for the next 30 days.</p>
                    </div>
                  ) : (
                    restockRecommendations.map((item) => (
                      <Link 
                        key={item.product_id} 
                        href={`/history/${item.product_id}`} 
                        className="block group"
                      >
                        <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:ring-2 hover:ring-indigo-100 transition-all relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full ${item.days_to_empty < 7 ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                          
                          <div className="pl-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{item.product_name}</p>
                                <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                              </div>
                              {item.days_to_empty < 7 && (
                                <AlertOctagon className="w-4 h-4 text-rose-500 animate-bounce" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs mt-3 pt-3 border-t border-slate-50">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Current</span>
                                <span className="font-bold text-slate-700">{item.current_stock}</span>
                              </div>
                              
                              <ArrowUpRight className="w-3 h-3 text-slate-300" />
                              
                              <div className="flex flex-col">
                                <span className="text-[9px] text-indigo-400 uppercase tracking-wider font-bold">Suggested</span>
                                <span className="font-bold text-indigo-700">{item.prediction_qty}</span>
                              </div>
                              
                              <div className="ml-auto text-right">
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-md border ${item.days_to_empty < 7 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                  {item.days_to_empty} days left
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                  
                  <Link href="/outbound" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] group">
                    <FileText className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
                    Generate Purchase Order
                  </Link>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={600}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" /> 
                    Live Feed
                  </h3>
                  <Link href="/activity" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">
                    View Full Log
                  </Link>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar">
                  {recentActivities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <div className="p-3 bg-slate-50 rounded-full mb-2">
                        <Activity className="w-5 h-5 opacity-50" />
                      </div>
                      <p className="text-xs italic">No activity recorded yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {recentActivities.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start group">
                          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ring-4 ring-white ${log.type === 'IN' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} shadow-sm`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-600 leading-relaxed">
                              <span className={`font-bold ${log.type === 'IN' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {log.type === 'IN' ? 'INBOUND' : 'OUTBOUND'}
                              </span> 
                              <span className="mx-1 text-slate-300">|</span>
                              <strong className="text-slate-900">{log.quantity}</strong> units of <span className="font-medium text-slate-800">{log.product_name}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{log.sku}</span>
                              <p className="text-[9px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {timeAgo(log.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={700}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden">
                <div className="flex gap-3 relative z-10">
                  <div className="p-2 bg-white rounded-lg h-fit text-blue-600 shadow-sm">
                    <Lightbulb className="w-4 h-4 fill-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Pro Tip</h4>
                    <p className="text-xs text-blue-700/80 leading-relaxed">
                      Gunakan fitur <strong className="text-blue-900">AI Auto-Generate</strong> untuk mempercepat input data hingga 70%. Tekan <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-[10px] mx-1 shadow-sm">Cmd+K</kbd> untuk akses cepat menu perintah.
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 text-blue-200 opacity-20 transform rotate-12">
                  <Zap className="w-24 h-24" />
                </div>
              </div>
            </FadeIn>

          </section>
        </div>
      </div>
    </main>
  );
}