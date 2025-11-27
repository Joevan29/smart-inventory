'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { MapPin, X } from 'lucide-react';
import Link from 'next/link';

interface LocationFilterProps {
  locations: string[]; 
}

export default function LocationFilter({ locations }: LocationFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentFilter = searchParams.get('location');

  const handleFilterChange = (location: string) => {
    const params = new URLSearchParams(searchParams);
    
    params.delete('query'); 
    
    if (location) {
      params.set('location', location);
      params.set('page', '1');
    } else {
      params.delete('location');
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex items-center gap-2">
        <MapPin className="w-4 h-4 text-slate-500" />
        <select
          value={currentFilter || ''}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="block rounded-md border border-slate-200 py-[9px] pl-2 pr-8 text-sm outline-none bg-white font-medium text-slate-700 appearance-none"
        >
          <option value="">All Zones</option>
          {locations.sort().map((loc) => (
            <option key={loc} value={loc}>
              Zone {loc}
            </option>
          ))}
        </select>
        
        {currentFilter && (
            <button
                onClick={() => handleFilterChange('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 absolute right-1 top-1/2 -translate-y-1/2"
                title="Clear filter"
            >
                <X className="w-4 h-4" />
            </button>
        )}
    </div>
  );
}