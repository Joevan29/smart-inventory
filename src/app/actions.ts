'use server';

import pool from '@/src/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod'; 
import { saveImage } from '@/src/lib/upload'; 
import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const productSchema = z.object({
  sku: z.string().min(3, "SKU minimal 3 karakter"),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z.string().optional(),
  price: z.coerce.number().min(100, "Harga tidak valid (min 100)"),
  location: z.string().min(2, "Lokasi wajib diisi"),
});

export type ActionState = {
  errors?: {
    sku?: string[];
    name?: string[];
    price?: string[];
    location?: string[];
    _form?: string[];
  };
  message?: string;
} | null;

interface PredictionResult {
  product_id: number;
  product_name: string;
  sku: string;
  current_stock: number;
  location: string;
  prediction_qty: number;
  days_to_empty: number;
}

export async function createProduct(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const rawData = {
    sku: formData.get('sku'),
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    location: formData.get('location'),
  };

  const validatedFields = productSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal validasi input. Periksa kembali data Anda.',
    };
  }

  const { sku, name, description, price, location } = validatedFields.data;
  const imageFile = formData.get('image') as File;
  let image_url = "/images/default-product.png"; 

  try {
    const uploadedPath = await saveImage(imageFile);
    if (uploadedPath) image_url = uploadedPath;
  } catch (error) {
    console.error('Upload Error:', error);
  }

  try {
    const checkSku = await pool.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (checkSku.rows.length > 0) {
      return {
        errors: { sku: ['SKU ini sudah terdaftar. Gunakan SKU lain.'] },
        message: 'Gagal menyimpan data (SKU Duplikat).',
      };
    }

    await pool.query(
      `INSERT INTO products (name, sku, description, price, location, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6, 0)`,
      [name, sku, description || '', price, location, image_url]
    );
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Terjadi kesalahan sistem database.' };
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
  const imageFile = formData.get('image') as File;

  try {
    let query = `UPDATE products SET name = $1, sku = $2, description = $3, price = $4, location = $5`;
    let params: any[] = [name, sku, description, price, location];
    
    const newImagePath = await saveImage(imageFile);
    if (newImagePath) {
        query += `, image_url = $6 WHERE id = $7`;
        params.push(newImagePath, id);
    } else {
        query += ` WHERE id = $6`;
        params.push(id);
    }

    await pool.query(query, params);
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

  if (!productId || !quantity || quantity <= 0) return { success: false, message: 'Jumlah harus angka positif!' };
  if (!notes || !notes.trim()) return { success: false, message: 'Catatan wajib diisi!' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query('SELECT stock FROM products WHERE id = $1', [productId]);
    const currentStock = res.rows[0]?.stock || 0;

    if (type === 'OUT' && currentStock < quantity) {
        await client.query('ROLLBACK');
        return { success: false, message: `Stok tidak cukup! Sisa: ${currentStock}` };
    }
    
    const newStock = type === 'IN' ? currentStock + quantity : currentStock - quantity;

    await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, notes, ending_stock)
       VALUES ($1, $2, $3, $4, $5)`, 
      [productId, type, quantity, notes, newStock]
    );
    await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [newStock, productId]);
    await client.query('COMMIT'); 
    
    revalidatePath('/');
    revalidatePath(`/history/${productId}`);
    return { success: true, message: 'Transaksi berhasil disimpan!' };
  } catch (error) {
    await client.query('ROLLBACK');
    return { success: false, message: 'Terjadi kesalahan sistem.' };
  } finally {
    client.release();
  }
}


export async function searchProducts(query: string) {
  if (!query || query.length < 2) return [];
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, sku, name, stock, price, location, image_url 
       FROM products WHERE name ILIKE $1 OR sku ILIKE $1 LIMIT 10`, [`%${query}%`]
    );
    return res.rows.map(row => ({ ...row, price: row.price.toString(), stock: Number(row.stock) }));
  } catch (error) { return []; } finally { client.release(); }
}

export async function processBulkTransaction(items: { id: number; quantity: number }[], type: 'IN' | 'OUT') {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      const res = await client.query('SELECT stock FROM products WHERE id = $1 FOR UPDATE', [item.id]);
      if (res.rows.length === 0) throw new Error(`Produk ID ${item.id} tidak ditemukan.`);
      const currentStock = Number(res.rows[0].stock);
      if (type === 'OUT' && currentStock < item.quantity) throw new Error(`Stok kurang untuk ID ${item.id}.`);
      
      const newStock = type === 'IN' ? currentStock + item.quantity : currentStock - item.quantity;
      await client.query(
        `INSERT INTO stock_movements (product_id, type, quantity, notes, ending_stock) VALUES ($1, $2, $3, $4, $5)`,
        [item.id, type, item.quantity, type === 'OUT' ? 'Bulk Out' : 'Bulk In', newStock]
      );
      await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [newStock, item.id]);
    }
    await client.query('COMMIT');
    revalidatePath('/'); 
    return { success: true, message: `Sukses memproses ${items.length} item!` };
  } catch (error: any) {
    await client.query('ROLLBACK');
    return { success: false, message: error.message || 'Gagal transaksi massal.' };
  } finally {
    client.release();
  }
}

export async function getProductBySku(sku: string) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM products WHERE sku = $1', [sku]);
    const product = res.rows[0];
    if (product) { product.stock = Number(product.stock); product.price = product.price.toString(); }
    return product || null;
  } catch (error) { return null; } finally { client.release(); }
}

export async function generateDescription(sku: string, name: string): Promise<{ success: boolean, description?: string, message?: string }> {
  if (!sku || !name) return { success: false, message: 'SKU dan Nama wajib diisi.' };
  if (!process.env.COHERE_API_KEY) return { success: false, message: 'API Key Cohere tidak ditemukan.' };

  const prompt = `Anda adalah Asisten Inventaris Profesional. 
  Tugas: Buat deskripsi produk yang ringkas (maksimal 3 kalimat) untuk produk berikut:
  - Nama: ${name}
  - SKU: ${sku}
  
  Bahasa: Indonesia.
  Output: Hanya teks deskripsi saja, tanpa pembuka atau penutup.`;

  try {
      const chatPrediction = await cohere.chat({
        model: 'command-r-08-2024',
        message: prompt,
      });

      const description = chatPrediction.text;
      return { success: true, description: description.trim() };
  } catch (error) {
      console.error('Cohere AI Error:', error);
      return { success: false, message: 'Gagal menghubungi Cohere AI.' };
  }
}

export async function getRestockPrediction(): Promise<PredictionResult[]> {
  const res = await pool.query(`
    SELECT p.id as product_id, p.name as product_name, p.sku, p.stock as current_stock, p.location, SUM(sm.quantity) as total_out
    FROM stock_movements sm JOIN products p ON sm.product_id = p.id
    WHERE sm.type = 'OUT' AND sm.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name, p.sku, p.stock, p.location
    ORDER BY total_out DESC LIMIT 3
  `);
  
  if (res.rows.length === 0) return [];
  return res.rows.map(row => {
    const avgDailyOut = Number(row.total_out) / 30;
    const predictionQty = Math.ceil(avgDailyOut * 90); 
    const daysToEmpty = avgDailyOut > 0 ? Math.floor(row.current_stock / avgDailyOut) : 999;
    return {
      product_id: row.product_id, product_name: row.product_name, sku: row.sku,
      current_stock: Number(row.current_stock), location: row.location || 'N/A',
      prediction_qty: predictionQty > 0 ? predictionQty : 10, days_to_empty: daysToEmpty,
    } as PredictionResult;
  });
}

export async function autoCreateProduct(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const prompt = formData.get('prompt') as string;
  if (!prompt || prompt.length < 5) return { message: 'Prompt terlalu pendek.' };
  if (!process.env.COHERE_API_KEY) return { message: 'API Key Cohere tidak ditemukan.' };

  const systemPrompt = `Anda adalah asisten database inventaris. 
  Tugas: Konversi permintaan pengguna menjadi data JSON produk valid.
  Format JSON Wajib:
  {
    "sku": "string (singkat, unik, kapital)",
    "name": "string (nama produk lengkap)",
    "description": "string (deskripsi pendek)",
    "price": integer (harga dalam IDR tanpa simbol),
    "location": "string (lokasi rak gudang)"
  }
  
  HANYA berikan JSON valid. Jangan ada teks lain atau markdown (seperti \`\`\`json).`;

  try {
      const response = await cohere.chat({
          model: 'command-r-08-2024',
          message: `Buatkan produk dari: "${prompt}"`,
          preamble: systemPrompt,
          temperature: 0.3,
      });

      let rawText = response.text.trim();
      rawText = rawText.replace(/```json/g, "").replace(/```/g, "");

      const aiData = JSON.parse(rawText);
      
      const validation = productSchema.safeParse({ ...aiData, price: Number(aiData.price) });
      if (!validation.success) {
        console.error("Validasi Gagal:", validation.error);
        return { message: "AI menghasilkan data tidak valid." };
      }

      const { sku, name, description, price, location } = validation.data;
      
      const checkSku = await pool.query('SELECT id FROM products WHERE sku = $1', [sku]);
      const finalSku = checkSku.rows.length > 0 ? `${sku}-${Math.floor(Math.random()*1000)}` : sku;

      await pool.query(
          `INSERT INTO products (name, sku, description, price, location, image_url, stock)
           VALUES ($1, $2, $3, $4, $5, $6, 0)`,
          [name, finalSku, description, price, location, "/images/default-product.png"]
      );

  } catch (error: any) {
      console.error('Auto-Create Error:', error);
      return { message: `Terjadi kesalahan AI: ${error.message}` };
  }

  revalidatePath('/');
  redirect('/');
}