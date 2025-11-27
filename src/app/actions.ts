'use server';

import pool from '@/src/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
  
  const image_url = "/images/default-product.png"; 

  try {
    const checkSku = await pool.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (checkSku.rows.length > 0) {
      return {
        errors: { sku: ['SKU ini sudah terdaftar. Gunakan SKU lain.'] },
        message: 'Gagal menyimpan data.',
      };
    }

    await pool.query(
      `INSERT INTO products (name, sku, description, price, location, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6, 0)`,
      [name, sku, description || '', price, location, image_url]
    );
  } catch (error) {
    console.error('Create Error:', error);
    return {
      message: 'Terjadi kesalahan database. Silakan coba lagi nanti.'
    };
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

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return [];

  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id, sku, name, stock, price, location, image_url 
       FROM products 
       WHERE name ILIKE $1 OR sku ILIKE $1 
       LIMIT 10`,
      [`%${query}%`]
    );
    
    return res.rows.map(row => ({
      ...row,
      price: row.price.toString(), 
      stock: Number(row.stock)
    }));
  } catch (error) {
    console.error('Search Error:', error);
    return [];
  } finally {
    client.release();
  }
}

export async function processBulkTransaction(items: { id: number; quantity: number }[], type: 'IN' | 'OUT') {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    for (const item of items) {
      const res = await client.query('SELECT stock FROM products WHERE id = $1 FOR UPDATE', [item.id]);
      
      if (res.rows.length === 0) {
         throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
      }

      const currentStock = Number(res.rows[0].stock);

      if (type === 'OUT' && currentStock < item.quantity) {
        throw new Error(`Stok tidak cukup untuk produk ID ${item.id}. Sisa: ${currentStock}`);
      }

      const newStock = type === 'IN' ? currentStock + item.quantity : currentStock - item.quantity;

      await client.query(
        `INSERT INTO stock_movements (product_id, type, quantity, notes, ending_stock)
         VALUES ($1, $2, $3, $4, $5)`,
        [item.id, type, item.quantity, type === 'OUT' ? 'Bulk Outbound Order' : 'Bulk Inbound Receipt', newStock]
      );

      await client.query(`UPDATE products SET stock = $1 WHERE id = $2`, [newStock, item.id]);
    }

    await client.query('COMMIT');
    revalidatePath('/'); 
    return { success: true, message: `Berhasil memproses ${items.length} item!` };

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Bulk Transaction Error:', error);
    return { success: false, message: error.message || 'Gagal memproses transaksi massal.' };
  } finally {
    client.release();
  }
}

export async function getProductBySku(sku: string) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM products WHERE sku = $1', [sku]);
    const product = res.rows[0];
    if (product) {
        product.stock = Number(product.stock);
        product.price = product.price.toString();
    }
    return product || null;
  } catch (error) {
    console.error('Scan Error:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function generateDescription(sku: string, name: string): Promise<{ success: boolean, description?: string, message?: string }> {
  
  if (!sku || !name) {
      return { success: false, message: 'SKU dan Nama wajib diisi terlebih dahulu untuk menghasilkan deskripsi.' };
  }

  if (!ai) {
      console.error("GEMINI_API_KEY is missing in .env.local");
      return { 
        success: false, 
        message: 'Konfigurasi Server Error: API Key AI tidak ditemukan.' 
      };
  }

  const prompt = `Anda adalah Asisten Inventaris Profesional untuk sistem WMS.
  Tugas: Buatlah deskripsi produk yang ringkas, menarik, dan profesional (maksimal 3 kalimat).
  Data Produk:
  - Nama: ${name}
  - SKU: ${sku}
  
  Deskripsi harus dalam Bahasa Indonesia yang baku dan menonjolkan nilai produk untuk keperluan logistik atau penjualan. Jangan sertakan teks pembuka seperti "Berikut adalah deskripsi...". Langsung ke konten deskripsi.`;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', 
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      });
      
      const generatedText = response.text().trim();

      if (!generatedText) {
          throw new Error('API mengembalikan respons kosong.');
      }

      return { success: true, description: generatedText };

  } catch (error) {
      console.error('AI Generation Error:', error);
      return { success: false, message: 'Gagal menghubungi Gemini AI. Pastikan koneksi internet server stabil.' };
  }
}

export async function getRestockPrediction(): Promise<PredictionResult[]> {
  const res = await pool.query(`
    SELECT 
      p.id as product_id, 
      p.name as product_name, 
      p.sku, 
      p.stock as current_stock,
      p.location,
      SUM(sm.quantity) as total_out
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    WHERE sm.type = 'OUT' AND sm.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY p.id, p.name, p.sku, p.stock, p.location
    ORDER BY total_out DESC
    LIMIT 3
  `);
  
  if (res.rows.length === 0) {
    return [];
  }

  // Logika Prediksi Sederhana
  return res.rows.map(row => {
    const totalOut = Number(row.total_out);
    const avgDailyOut = totalOut / 30; 
    const predictionQty = Math.ceil(avgDailyOut * 90); 
    
    const daysToEmpty = avgDailyOut > 0 ? Math.floor(row.current_stock / avgDailyOut) : 999;
    
    return {
      product_id: row.product_id,
      product_name: row.product_name,
      sku: row.sku,
      current_stock: Number(row.current_stock),
      location: row.location || 'N/A',
      prediction_qty: predictionQty > 0 ? predictionQty : 10,
      days_to_empty: daysToEmpty,
    } as PredictionResult;
  });
}