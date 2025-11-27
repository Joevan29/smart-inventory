// src/app/api/export/[id]/route.ts
import pool from '@/src/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/src/auth'; 

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const productRes = await pool.query('SELECT name, sku FROM products WHERE id = $1', [id]);
    const product = productRes.rows[0];

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const historyRes = await pool.query(
      'SELECT type, quantity, notes, created_at, ending_stock FROM stock_movements WHERE product_id = $1 ORDER BY created_at DESC',
      [id]
    );
    const history = historyRes.rows;

    const csvHeader = ['Date', 'Time', 'Type', 'Quantity', 'Notes', 'Ending Stock'].join(',');

    const csvRows = history.map(log => {
      const date = new Date(log.created_at);
      const dateStr = date.toLocaleDateString('id-ID');
      const timeStr = date.toLocaleTimeString('id-ID');
      
      const cleanNotes = log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '';

      return [dateStr, timeStr, log.type, log.quantity, cleanNotes, log.ending_stock].join(',');
    });

    const csvString = [csvHeader, ...csvRows].join('\n');

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="History_${product.sku}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}