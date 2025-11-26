import { signIn } from "@/src/auth";
import { Box, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-50/60 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-900 text-white mb-4 shadow-lg shadow-slate-900/20">
              <Box className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">WMS Enterprise</h1>
            <p className="text-slate-500 text-sm mt-2">Secure Warehouse Access</p>
          </div>

          <form
            action={async (formData) => {
              "use server";
              await signIn("credentials", formData);
            }}
            className="space-y-5"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@wms.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="•••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2 text-sm group"
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="pt-4 mt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure Encrypted Connection
              </p>
              <p className="text-[10px] text-slate-300 mt-2">
                Default: admin@wms.com / admin
              </p>
            </div>
          </form>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          © 2025 WMS Enterprise System. All rights reserved.
        </p>
      </div>
    </main>
  );
}