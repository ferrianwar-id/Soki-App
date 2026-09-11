// Strict image validation & Image Upload System with auto-retry and offline/flight mode resilience
export interface ValidationResult {
  valid: boolean;
  error?: string;
  cleanFileName?: string;
}

export interface UploadResult {
  url: string;
  fileName: string;
  source: 'google-drive' | 'direct';
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
  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Format .${ext} tidak didukung! Hanya diperbolehkan format file asli JPG, JPEG, atau PNG.`
    };
  }

  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png'];
  if (file.type && !allowedMime.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Tipe file tidak valid. Pastikan gambar bertipe JPG, JPEG, atau PNG murni.`
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Ukuran file terlalu besar. Maksimum ukuran gambar adalah 5MB.'
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
        const maxDimension = 1400;
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
            mimeType: file.type || 'image/jpeg'
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.name.toLowerCase().endsWith('.png');
        const mime = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? 0.9 : 0.85;
        const dataUrl = canvas.toDataURL(mime, quality);
        const parts = dataUrl.split(',');
        resolve({
          base64: parts[1],
          mimeType: mime
        });
      };
      img.onerror = () => {
        const raw = (e.target?.result as string) || '';
        const parts = raw.split(',');
        resolve({
          base64: parts[1] || raw,
          mimeType: file.type || 'image/jpeg'
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
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

  const { base64, mimeType } = await convertFileToBase64(file);

  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const productFolderId = "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
  const cardFolderId = "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn";
  const selectedFolderId = target === 'landingpage' ? cardFolderId : productFolderId;
  const directWebhookUrl = webhookOverrideUrl || "https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec";

  let attempt = 0;
  while (true) {
    attempt++;

    // Jika offline atau mode pesawat aktif (navigator.onLine === false)
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (onStatusChange) {
        onStatusChange('Mode Pesawat / Offline. Menunggu koneksi kembali...');
      }
      await new Promise((resolve) => {
        const handleOnline = () => {
          window.removeEventListener('online', handleOnline);
          resolve(true);
        };
        window.addEventListener('online', handleOnline);
        const poll = setInterval(() => {
          if (navigator.onLine) {
            clearInterval(poll);
            window.removeEventListener('online', handleOnline);
            resolve(true);
          }
        }, 1500);
      });
    }

    if (onStatusChange) {
      onStatusChange(attempt > 1 ? `Mencoba ulang kirim ke Google Drive (${attempt})...` : 'Mengunggah file foto ke Google Drive...');
    }

    // 1. Coba upload via backend API (/api/admin/upload-drive)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({
          fileName: file.name,
          base64: cleanBase64,
          mimeType,
          target
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.url && !data.url.startsWith('data:')) {
          return {
            url: data.url,
            fileName: file.name,
            source: data.source || 'google-drive'
          };
        }
      }
    } catch {
      // Backend API not reachable or timeout, proceed to direct Apps Script webhook
    }

    // 2. Direct upload to Google Apps Script Webhook (Sangat handal untuk static hosting cPanel)
    if (directWebhookUrl && directWebhookUrl.startsWith('http')) {
      try {
        if (onStatusChange) {
          onStatusChange('Mengirim langsung ke Google Drive Webhook...');
        }

        const driveRes = await fetch(directWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            fileName: file.name,
            base64: cleanBase64,
            mimeType,
            target: target || 'product',
            folderId: selectedFolderId
          }),
          redirect: 'follow'
        });

        if (driveRes.ok) {
          const driveData: any = await driveRes.json();
          if (driveData.url || driveData.id) {
            const finalDriveUrl = driveData.url || `https://lh3.googleusercontent.com/d/${driveData.id}`;
            return {
              url: finalDriveUrl,
              fileName: file.name,
              source: 'google-drive'
            };
          }
        }
      } catch (directErr: any) {
        console.warn('Direct Apps Script upload notice:', directErr?.message || directErr);
      }
    }

    // Jika attempt melebihi 2 dan user menunggu, jangan stuck
    if (attempt >= 2) {
      const fallbackDataUrl = `data:${mimeType};base64,${cleanBase64}`;
      return {
        url: fallbackDataUrl,
        fileName: file.name,
        source: 'direct'
      };
    }

    const delay = Math.min(6000, attempt * 1500);
    if (onStatusChange) {
      onStatusChange(`Menghubungi Google Drive ulang dalam ${Math.round(delay/1000)} detik...`);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const uploadToGoogleDriveWebhook = uploadImageFile;
