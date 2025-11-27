import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveImage(file: File): Promise<string | null> {
  if (!file || file.size === 0 || file.name === 'undefined') {
    return null;
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
  const fileName = `${timestamp}-${safeName}`;
  
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const filePath = join(uploadDir, fileName);

  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Gagal menyimpan gambar ke server.');
  }
}