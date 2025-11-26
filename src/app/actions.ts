'use server';

import pool from '@/src/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price');
  const image_url = "https://placehold.co/600x400?text=No+Image";

  try {
    await pool.query(
      `INSERT INTO products (name, sku, description, price, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [name, sku, description, price, image_url]
    );
  } catch (error) {
    console.error('Create Error:', error);
    return;
  }

  revalidatePath('/');
  redirect('/');
}

export async function updateStock(prevState: any, formData: FormData) {
  const productId = formData.get('productId');
  const type = formData.get('type') as 'IN' | 'OUT';
  const quantity = parseInt(formData.get('quantity') as string);
  const notes = formData.get('notes') as string;

  if (!productId || !quantity || quantity <= 0) {
    return { success: false, message: 'Jumlah harus angka positif!' };
  }
  if (!notes || notes.trim() === '') {
    return { success: false, message: 'Catatan transaksi wajib diisi!' };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    if (type === 'OUT') {
      const res = await client.query('SELECT stock FROM products WHERE id = $1', [productId]);
      const currentStock = res.rows[0]?.stock || 0;

      if (currentStock < quantity) {
        await client.query('ROLLBACK');
        return { success: false, message: `Stok tidak cukup! Sisa: ${currentStock}` };
      }
    }

    await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, notes)
       VALUES ($1, $2, $3, $4)`,
      [productId, type, quantity, notes]
    );

    const operator = type === 'IN' ? '+' : '-';
    await client.query(
      `UPDATE products SET stock = stock ${operator} $1 WHERE id = $2`,
      [quantity, productId]
    );

    await client.query('COMMIT'); 
    revalidatePath('/');
    revalidatePath(`/history/${productId}`);
    
    return { success: true, message: 'Transaksi berhasil disimpan!' };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction Error:', error);
    return { success: false, message: 'Terjadi kesalahan pada server database.' };
  } finally {
    client.release();
  }
}