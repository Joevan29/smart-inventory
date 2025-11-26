'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center gap-2 mt-8">
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 border rounded text-sm ${
          currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100'
        }`}
      >
        Previous
      </Link>

      <div className="px-4 py-2 text-sm font-bold text-slate-700">
        Page {currentPage} of {totalPages}
      </div>

      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 border rounded text-sm ${
          currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-slate-100'
        }`}
      >
        Next
      </Link>
    </div>
  );
}