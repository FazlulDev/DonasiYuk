/**
 * DOM & formatting utilities for Sahabat Yatim.
 */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function escHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] || char;
  });
}

export function formatRupiah(amount) {
  const num = Number(amount || 0);
  return 'Rp' + num.toLocaleString('id-ID');
}

export function formatNumber(amount) {
  return Number(amount || 0).toLocaleString('id-ID');
}

export function isoDayOffset(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 86400000);
  return date.toISOString().slice(0, 10);
}

export function calcProgress(program) {
  if (!program) return 0;
  const target = Math.max(1, Number(program.targetDonasi || 1));
  const raised = Math.max(0, Number(program.danaTerkumpul || 0));
  return Math.min(100, Math.round((raised / target) * 100));
}

export function calcDaysLeft(program) {
  if (!program || !program.tanggalSelesai) return 0;
  const diffMs = new Date(program.tanggalSelesai).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 86400000));
}

export function buildWhatsAppUrl(phone, message) {
  const cleaned = String(phone || '').replace(/[^\d]/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export async function sha256Hex(text) {
  const input = 'sy:' + String(text ?? '');
  try {
    if (window.crypto?.subtle) {
      const buffer = await window.crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(input)
      );
      return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fallback below if Web Crypto is unavailable
  }
  let hash = 5381;
  for (const ch of input) {
    hash = ((hash * 33) ^ ch.charCodeAt(0)) >>> 0;
  }
  return 'fallback-' + hash.toString(16);
}

export function exportToCsv(filename, headers, rows) {
  const escapeCell = (val) => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ];
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  return ok;
}

export function resizeImageFile(file, maxWidth = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, atau WebP).'));
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      reject(new Error('Ukuran file maksimal 6 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses gambar.'));
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}
