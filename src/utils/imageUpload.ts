// Strict image validation & Google Drive Image Upload System
export interface ValidationResult {
  valid: boolean;
  error?: string;
  cleanFileName?: string;
}

export interface UploadResult {
  url: string;
  fileName: string;
  source: 'google-drive' | 'direct' | 'compressed-image';
}

export function validateImageFile(file: File): ValidationResult {
  const fileName = file.name;
  
  const parts = fileName.split('.');
  if (parts.length > 2) {
    return {
      valid: false,
      error: `Format file tidak diizinkan ("${fileName}"). Dilarang menggunakan ekstensi ganda seperti "${fileName}". Format harus satu ekstensi murni (contoh: foto.jpg atau gambar.png).`
    };
  }
  if (parts.length < 2) {
    return {
      valid: false,
      error: `File "${fileName}" tidak memiliki ekstensi gambar (.jpg, .jpeg, atau .png).`
    };
  }

  const ext = parts[1].toLowerCase().trim();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Format .${ext} tidak didukung! Hanya diperbolehkan format file asli JPG, JPEG, PNG, atau WEBP.`
    };
  }

  if (file.size > 8 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Ukuran file terlalu besar. Maksimum ukuran gambar adalah 8MB.'
    };
  }

  return {
    valid: true,
    cleanFileName: fileName
  };
}

export async function convertFileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Menjaga ketajaman dan resolusi tinggi gambar asli (HD hingga 1920px)
        const maxDimension = 1920;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const raw = (e.target?.result as string) || '';
          const parts = raw.split(',');
          resolve({
            base64: parts[1] || raw,
            mimeType: 'image/webp'
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Kompres dengan resolusi tinggi (High Quality WebP 0.90) tanpa menurunkan detail gambar
        const mime = 'image/webp';
        const quality = 0.90;
        const dataUrl = canvas.toDataURL(mime, quality);
        const parts = dataUrl.split(',');
        
        resolve({
          base64: parts[1] || dataUrl,
          mimeType: mime
        });
      };
      img.onerror = () => {
        const raw = (e.target?.result as string) || '';
        const parts = raw.split(',');
        resolve({
          base64: parts[1] || raw,
          mimeType: 'image/jpeg'
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari perangkat.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageFile(
  file: File, 
  adminToken?: string, 
  target: 'product' | 'landingpage' = 'product',
  onStatusChange?: (statusText: string) => void,
  webhookOverrideUrl?: string
): Promise<UploadResult> {
  const check = validateImageFile(file);
  if (!check.valid) {
    throw new Error(check.error);
  }

  // Dapatkan URL Webhook Google Drive aktif
  let webhookUrl = (webhookOverrideUrl || '').trim();
  if (!webhookUrl && typeof window !== 'undefined') {
    webhookUrl = (localStorage.getItem('soki_google_drive_webhook') || '').trim();
  }
  if (!webhookUrl) {
    webhookUrl = "https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec";
  }

  if (onStatusChange) {
    onStatusChange('Mengompresi foto & menyiapkan...');
  }

  const { base64, mimeType } = await convertFileToBase64(file);
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const localDataUrl = `data:${mimeType || 'image/webp'};base64,${cleanBase64}`;

  const productFolderId = "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
  const cardFolderId = "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn";
  const selectedFolderId = target === 'landingpage' ? cardFolderId : productFolderId;

  if (onStatusChange) {
    onStatusChange('Mengunggah langsung ke Google Drive...');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 detik timeout

    // PURE CLIENT-SIDE UPLOAD LANGSUNG KE GOOGLE APPS SCRIPT WEBHOOK
    // Penggunaan text/plain;charset=utf-8 adalah standar emas untuk Google Apps Script
    // karena menghindari CORS preflight OPTIONS blocking dari browser
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        fileName: file.name.split('.')[0] + '.webp',
        base64: cleanBase64,
        mimeType: mimeType || 'image/webp',
        target: target,
        folderId: selectedFolderId
      }),
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await res.text();
    let data: any = {};
    let isJson = false;
    try {
      data = JSON.parse(responseText);
      isJson = true;
    } catch {
      isJson = false;
    }

    if (isJson) {
      const driveId = data.id || data.fileId || data.file_id;
      const driveUrl = data.url || data.fileUrl || data.directUrl || data.downloadUrl || (driveId ? ("https://lh3.googleusercontent.com/d/" + driveId) : null);

      if (driveUrl) {
        return {
          url: driveUrl,
          fileName: file.name,
          source: "google-drive"
        };
      }
    }

    // Jika response text mengandung ID atau link Google Drive secara langsung
    const idMatch = responseText.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/) ||
                    responseText.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/) ||
                    responseText.match(/"(?:id|fileId|file_id|docId)":\s*"([a-zA-Z0-9_-]+)"/i) ||
                    responseText.match(/(?:id|fileId|file_id)=([a-zA-Z0-9_-]{25,50})/i);

    if (idMatch && idMatch[1]) {
      return {
        url: "https://lh3.googleusercontent.com/d/" + idMatch[1],
        fileName: file.name,
        source: "google-drive"
      };
    }

    // Jika upload berhasil diterima oleh server / webhook (HTML respon redirect Google)
    // gunakan gambar terkompresi berkualitas tinggi agar gambar langsung terpasang tanpa error
    if (res.ok || res.status === 200 || responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
      return {
        url: localDataUrl,
        fileName: file.name,
        source: "compressed-image"
      };
    }

    return {
      url: localDataUrl,
      fileName: file.name,
      source: "compressed-image"
    };
  } catch (err: any) {
    console.warn("Google Drive upload notice:", err);
    // Kembalikan gambar terkompresi agar preview dan form tetap tersimpan dengan lancar
    return {
      url: localDataUrl,
      fileName: file.name,
      source: "compressed-image"
    };
  }
}

export const uploadToGoogleDriveWebhook = uploadImageFile;

/**
 * Ekstrak ID File Google Drive dari URL (mendukung format lh3.googleusercontent.com/d/ID, drive.google.com, uc?id=, dll)
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pola 1: lh3.googleusercontent.com/d/{ID}
  const match1 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];

  // Pola 2: drive.google.com/file/d/{ID}
  const match2 = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];

  // Pola 3: drive.google.com/open?id={ID} atau uc?id={ID}
  const match3 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match3 && match3[1]) return match3[1];

  // Pola 4: Jika hanya ID Google Drive langsung (biasanya 25-45 karakter alfanumerik)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  // Pola 5: General fallback jika URL mengandung domain google dan ada string ID panjang
  if (trimmed.includes('google')) {
    const match5 = trimmed.match(/([a-zA-Z0-9_-]{25,50})/);
    if (match5 && match5[1]) return match5[1];
  }

  return null;
}

/**
 * Hapus foto dari Google Drive via Webhook Apps Script
 */
export async function deleteFromGoogleDriveWebhook(
  imageUrlOrFileId: string,
  webhookOverrideUrl?: string
): Promise<{ success: boolean; message?: string; fileId?: string }> {
  if (!imageUrlOrFileId) {
    return { success: false, message: 'URL atau ID file kosong' };
  }

  const fileId = extractGoogleDriveFileId(imageUrlOrFileId);
  if (!fileId) {
    // Bukan foto Google Drive (misal gambar lokal / SVG / placeholder), abaikan tanpa error
    return { success: true, message: 'Bukan foto Google Drive' };
  }

  // Cari URL webhook
  let webhookUrl = (webhookOverrideUrl || '').trim();
  if (!webhookUrl && typeof window !== 'undefined') {
    webhookUrl = (localStorage.getItem('soki_google_drive_webhook') || '').trim();
  }
  if (!webhookUrl) {
    webhookUrl = "https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'delete',
        fileId: fileId,
        url: imageUrlOrFileId
      }),
      redirect: 'follow',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: res.ok };
    }

    if (data.success) {
      return {
        success: true,
        fileId: fileId,
        message: data.message || 'Foto di Google Drive berhasil dihapus'
      };
    } else {
      return {
        success: false,
        fileId: fileId,
        message: data.error || 'Gagal menghapus file dari Google Drive'
      };
    }
  } catch (err: any) {
    // Catat log tanpa memblokir proses aplikasi
    console.warn(`[Google Drive Delete] Warning deleting file ${fileId}:`, err);
    return {
      success: false,
      fileId: fileId,
      message: err.message || 'Koneksi ke Google Drive terputus saat menghapus'
    };
  }
}
