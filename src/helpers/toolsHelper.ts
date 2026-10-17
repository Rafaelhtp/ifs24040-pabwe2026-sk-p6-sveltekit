import Swal from "sweetalert2";

declare const DELCOM_BASEURL: string;

export function showErrorDialog(message: string): any {
  return Swal.fire({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#ef4444",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showWarningDialog(message: string): any {
  return Swal.fire({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#f59e0b",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showSuccessDialog(message: string): any {
  return Swal.fire({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#10b981",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  });
}

export function showConfirmDialog(message: string): any {
  return Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#94a3b8",
  });
}

export function formatDate(date: string | number | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ABSOLUTE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * Menormalkan URL aset (foto/cover) dari API. URL absolut (http, https, data, blob, //)
 * dibiarkan; path relatif (mis. "storage/a.png") diarahkan ke origin Delcom API supaya
 * tidak diminta ke domain aplikasi sendiri (404 + error di console).
 */
export function getAssetUrl(path: string): string {
  if (ABSOLUTE_URL.test(path)) return path;
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\/+/, "")}`;
}

const FALLBACK_IMAGE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" fill="#e2e8f0"/>' +
  '<circle cx="32" cy="26" r="10" fill="#94a3b8"/>' +
  '<path d="M12 56c2-12 12-18 20-18s18 6 20 18z" fill="#94a3b8"/></svg>';

export const FALLBACK_IMAGE_SRC = `data:image/svg+xml,${encodeURIComponent(FALLBACK_IMAGE_SVG)}`;

/** Handler `error` untuk <img>: ganti gambar gagal-muat dengan placeholder inline. */
export function handleImageError(event: Event): void {
  (event.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_SRC;
}
