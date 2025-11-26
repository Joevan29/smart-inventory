'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  Smile, 
  User, 
  Search,
  Plus,
  Package,
  History,
  LogOut
} from 'lucide-react';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 hidden md:flex items-center gap-2 text-xs text-slate-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
        <span>Press</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
        <span>to search</span>
      </div>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white rounded-xl shadow-2xl border border-slate-200 z-[9999] overflow-hidden p-0 animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex items-center border-b border-slate-100 px-4" cmdk-input-wrapper="">
          <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
          <Command.Input 
            placeholder="Type a command or search..." 
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0"
          />
        </div>
        
        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
          <Command.Empty className="py-6 text-center text-sm text-slate-500">
            No results found.
          </Command.Empty>

          <Command.Group heading="Quick Actions" className="text-xs font-medium text-slate-500 px-2 py-1.5">
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/add'))}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Register New SKU</span>
            </Command.Item>
            
            <Command.Item 
              onSelect={() => runCommand(() => router.push('/'))}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-colors"
            >
              <Package className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="System" className="text-xs font-medium text-slate-500 px-2 py-1.5 mt-2">
            <Command.Item 
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 cursor-pointer aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profile (Coming Soon)</span>
            </Command.Item>
            <Command.Item 
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 cursor-pointer aria-selected:bg-rose-50 aria-selected:text-rose-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>

      {open && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[9998]" />}
    </>
  );
}