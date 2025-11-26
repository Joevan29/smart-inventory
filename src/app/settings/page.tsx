import { auth, signOut } from '@/src/auth';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Smartphone, 
  LogOut, 
  ArrowLeft,
  Mail,
  Lock,
  Save,
  HardDrive
} from 'lucide-react';

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
              <p className="text-sm text-slate-500">Manage your profile and system preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-800 to-slate-900"></div>
              
              <div className="relative z-10 mt-8">
                <div className="w-24 h-24 mx-auto bg-white rounded-full p-1.5 shadow-lg mb-4">
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900">{user?.name || 'Administrator'}</h2>
                <p className="text-sm text-slate-500 mb-4">{user?.email || 'admin@wms.com'}</p>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  <Shield className="w-3 h-3" /> Super Admin
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Status</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" /> Database
                  </span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Version
                  </span>
                  <span className="text-slate-700 font-mono font-bold">v2.5.0 (Enterprise)</span>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-2 space-y-6">
            
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">General Information</h3>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        defaultValue={user?.name || ''}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        defaultValue={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="button" className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Preferences</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Email Notifications</p>
                      <p className="text-xs text-slate-500">Receive daily stock summaries</p>
                    </div>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">App Alerts</p>
                      <p className="text-xs text-slate-500">Push notifications for low stock</p>
                    </div>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Security</h3>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Password</p>
                    <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="pt-4">
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button className="w-full py-3 border border-rose-200 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center justify-center gap-2 text-sm">
                      <LogOut className="w-4 h-4" />
                      Sign Out from all devices
                    </button>
                  </form>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}