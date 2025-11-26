'use server';

import pool from '@/src/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price');
  const location = formData.get('location') as string;
  const image_url = "https://placehold.co/600x400?text=No+Image"; 

  try {
    await pool.query(
      // ⬅️ Perubahan: Tambahkan 'location' ke query INSERT
      `INSERT INTO products (name, sku, description, price, location, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6, 0)`,
      [name, sku, description, price, location, image_url]
    );
  } catch (error) {
    console.error('Create Error:', error);
    return;
  }

  revalidatePath('/');
  redirect('/');
}

export async function editProduct(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price');
  const location = formData.get('location') as string;

  try {
    await pool.query(
      `UPDATE products SET name = $1, sku = $2, description = $3, price = $4, location = $5 WHERE id = $6`,
      [name, sku, description, price, location, id]
    );
  } catch (error) {
    console.error('Edit Error:', error);
    return; 
  }

  revalidatePath('/');
  revalidatePath(`/history/${id}`);
  redirect(`/history/${id}`);
}

export async function deleteProduct(id: number) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM stock_movements WHERE product_id = $1', [id]);
    await client.query('DELETE FROM products WHERE id = $1', [id]);
    await client.query('COMMIT');
    
    revalidatePath('/');
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete Error:', error);
    return { success: false, message: 'Failed to delete product' };
  } finally {
    client.release();
  }
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
    
    const res = await client.query('SELECT stock FROM products WHERE id = $1', [productId]);
    const currentStock = res.rows[0]?.stock || 0;

    if (type === 'OUT') {
      if (currentStock < quantity) {
        await client.query('ROLLBACK');
        return { success: false, message: `Stok tidak cukup! Sisa: ${currentStock}` };
      }
    }
    
    const newStock = type === 'IN' ? currentStock + quantity : currentStock - quantity;

    await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, notes, ending_stock)
       VALUES ($1, $2, $3, $4, $5)`, 
      [productId, type, quantity, notes, newStock]
    );

    await client.query(
      `UPDATE products SET stock = $1 WHERE id = $2`, 
      [newStock, productId]
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