import pool from '@/src/lib/db';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Activity, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';

interface ActivityLog {
  id: number;
  type: 'IN' | 'OUT';
  quantity: number;
  notes: string;
  created_at: Date;
  product_name: string;
  sku: string;
  ending_stock: number;
}

async function getActivities() {
  const res = await pool.query(`
    SELECT 
      sm.id, sm.type, sm.quantity, sm.notes, sm.created_at, sm.ending_stock,
      p.name as product_name, p.sku
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    ORDER BY sm.created_at DESC
    LIMIT 100
  `);
  return res.rows as ActivityLog[];
}

export default async function ActivityPage() {
  const activities = await getActivities();

  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString('id-ID', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityLog[]>);

  return (
    <main className="min-h-screen bg-slate-50/50 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Global Audit Trail
              </h1>
              <p className="text-xs text-slate-500">Monitoring pergerakan stok real-time</p>
            </div>
          </div>
          
          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden sm:block">
            Last 100 Records
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 md:left-8"></div>

          {Object.keys(groupedActivities).length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 font-bold">No activity found</h3>
              <p className="text-slate-500 text-sm">Belum ada transaksi yang tercatat di sistem.</p>
            </div>
          ) : (
            Object.entries(groupedActivities).map(([date, items]) => (
              <div key={date} className="mb-10 relative">
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center bg-indigo-50 border-4 border-white rounded-full shadow-sm z-10 relative">
                    <CalendarDays className="w-4 h-4 md:w-6 md:h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-sm md:text-base font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    {date}
                  </h2>
                </div>

                {/* Activity Items */}
                <div className="space-y-4 pl-10 md:pl-20">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              item.type === 'IN' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {item.type === 'IN' ? 'Stock In' : 'Stock Out'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-slate-900 text-sm mb-0.5">
                            {item.product_name}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono mb-2">{item.sku}</p>
                          
                          {item.notes && (
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs text-slate-600 italic inline-block">
                              "{item.notes}"
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-extrabold flex items-center justify-end gap-1 ${
                            item.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {item.type === 'IN' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            {item.quantity}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium mt-1">
                            Balance: <strong className="text-slate-700">{item.ending_stock}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}