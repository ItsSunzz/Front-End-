export type ViewType = 'dashboard' | 'input-data' | 'lihat-data' | 'verifikasi-data' | 'manajemen-user' | 'history' | 'kelola-data' | 'profil' | 'pengaturan' | 'user-management';


// Tipe sesi pengguna yang sedang login
export interface UserSession {
  isLoggedIn: boolean;
  nama: string;
  role: string;
  avatar: string;
  email?: string;
  kecamatan?: string;
  nip?: string;
  telepon?: string;
}

export interface UserAccount {
  id: string;
  nama: string;
  email: string;
  role: 'Super Admin' | 'Admin Kecamatan' | 'Operator/Viewer' | 'super_admin' | 'kecamatan';
  wilayah: string;
  status: 'Aktif' | 'Nonaktif' | 'aktif' | 'nonaktif';
  terakhirLogin: string;
  kecamatan_id?: number | null;
  district_id?: number | null;
}

export interface ActivityLog {
  id: string;
  user: string;
  aksi: string;
  waktu: string;
  tipe: 'success' | 'warning' | 'info' | 'error';
}

// Tipe data formulir pendaftaran penerima bantuan
export interface FormData {
  // Identitas Diri
  namaLengkap: string;
  nik: string;
  noKK: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  kategoriPenerima: string;
  rt: string;
  rw: string;
  kecamatan: string;
  desaKelurahan: string;
  dusun?: string;

  // Rekening
  namaPemilikRekening: string;
  noRekening: string;
  bank: string;

  // Dokumen Upload
  masaJabatanMulai: string;
  masaJabatanSelesai: string;
  dokumenUploaded: {
    ktp: File | string | null;
    kk: File | string | null;
    suratPutusan: File | string | null;
    suratKeterangan: File | string | null;
    suratPimpinanPondok: File | string | null;
    suratGuruMengaji: File | string | null;
  };
}

// Tipe data penerima bantuan yang sudah terdaftar
export interface Recipient {
  id?: number;
  catatan?: string;
  nama: string;
  nik: string;
  kategori: string;
  kecamatan: string;
  bank: string;
  status: 'Terverifikasi' | 'Pending' | 'Ditolak';
  desaKelurahan: string;
  tahun: string;
  noKK?: string;
  masaJabatanMulai?: string;
  masaJabatanSelesai?: string;
  tanggalInput?: string; // format: "2026-04-15" atau "15/04/2026"
  updatedAt?: string;

  // Detailed fields mapped from FormData
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  rt?: string;
  rw?: string;
  dusun?: string;
  namaPemilikRekening?: string;
  noRekening?: string;
  dokumenUploaded?: {
    ktp: string | null;
    kk: string | null;
    suratPutusan: string | null;
    suratKeterangan: string | null;
    suratPimpinanPondok: string | null;
    suratGuruMengaji: string | null;
  };
}