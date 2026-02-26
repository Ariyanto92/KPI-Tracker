# KPI Tracker System - User Manual

Aplikasi **KPI Tracker** adalah sistem manajemen kinerja berbasis web yang dirancang untuk memantau Strategic Plan perusahaan (Target 2026). Aplikasi ini terintegrasi penuh dengan **Google Sheets** sebagai database backend, memungkinkan kolaborasi, penyimpanan data yang aman, dan pemantauan real-time.

## 🚀 Fitur Utama

*   **Dashboard Interaktif**: Visualisasi progress KPI dengan grafik batang dan diagram donat yang responsif.
*   **Manajemen Aktivitas (CRUD)**: Tambah, Edit, Hapus, dan Duplikasi aktivitas strategis dengan mudah.
*   **Timeline Tracking**: Pemantauan status bulanan (Plan, Actual, Missed) secara visual dengan sistem klik.
*   **Integrasi Google Sheets**: Simpan dan muat data langsung dari spreadsheet untuk persistensi data.
*   **Multi-Perspektif**: Pengelompokan KPI berdasarkan perspektif (Keuangan, Pelanggan, Proses, Pertumbuhan).
*   **Sistem Login**: Otentikasi pengguna berbasis data di Google Sheets dengan fitur "Remember Me".
*   **Mode Tampilan**: Dukungan untuk Light Mode dan Dark Mode.
*   **Responsive Design**: Tampilan yang menyesuaikan perangkat (Desktop/Tablet/Mobile) dengan sidebar yang dapat diciutkan.

---

## 📋 Persiapan Database (Google Sheets)

Agar aplikasi berjalan dengan baik, pastikan Anda memiliki Google Spreadsheet dengan struktur sheet sebagai berikut:

### 1. Sheet "KPI Data"
Digunakan untuk menyimpan data aktivitas KPI. Pastikan header kolom (Baris 1) adalah:
1.  **Timestamp** (Waktu penyimpanan)
2.  **ID** (ID Unik Aktivitas)
3.  **KPI Periode** (Tahun, misal: 2026)
4.  **PERSPEKTIF** (Keuangan, Pelanggan, dll)
5.  **Perspective Order** (Urutan tampilan perspektif)
6.  **TARGET**
7.  **STRATEGY**
8.  **ACTIVITY PLAN**
9.  **PIC**
10. **TIMELINE (JSON)** (Data status bulanan dalam format JSON)
11. **LINK SHEET** (Link dokumen pendukung)

### 2. Sheet "Users"
Digunakan untuk data login pengguna. Header kolom (Baris 1):
1.  **Username**
2.  **Password**
3.  **Full Name** (Nama yang akan tampil di aplikasi)
4.  **Photo URL** (Link foto profil - opsional)

> **Catatan Teknis:** ID Spreadsheet harus dikonfigurasi di dalam file script backend (`Code.gs`) pada variabel atau fungsi pembuka spreadsheet.

---

## 📖 Panduan Penggunaan

### 1. Login & Akses
*   Buka aplikasi melalui browser.
*   Klik ikon **User** di pojok kanan atas header atau coba lakukan aksi edit/simpan untuk memunculkan modal login.
*   Masukkan **Username** dan **Password** yang terdaftar.
*   Klik **Login**.

### 2. Membaca Dashboard
*   **Statistik Ringkas**: Kartu di bagian atas menampilkan total perspektif, aktivitas, status selesai, dan persentase progress keseluruhan.
*   **Grafik**:
    *   *Progress per Perspektif*: Grafik batang yang menunjukkan rata-rata penyelesaian per kategori.
    *   *Status Chart*: Diagram donat untuk melihat proporsi aktivitas (Completed, On Progress, Missed).
*   **Tabel Utama**: Daftar detail aktivitas. Kolom Timeline menunjukkan status per bulan.

### 3. Mengelola Aktivitas
*   **Menambah Data**: Klik tombol **"Tambah Aktivitas"** di pojok kanan atas. Isi form detail dan atur timeline awal.
*   **Mengedit Data**: Klik tombol ikon **Pensil** pada baris aktivitas di tabel.
*   **Menghapus Data**: Klik tombol ikon **Sampah** untuk menghapus aktivitas.
*   **Duplikasi**: Klik tombol ikon **Plus (+)** pada baris tabel untuk menyalin data baris tersebut sebagai template aktivitas baru.
*   **Link Sheet**: Klik tombol ikon **Spreadsheet** di baris tabel untuk membuka dokumen pendukung (jika ada).

### 4. Mengatur Timeline (Status Bulanan)
Pada kolom Timeline di tabel utama atau di dalam modal edit, status bulan direpresentasikan dengan warna:
*   **Kuning**: *Plan* (Rencana)
*   **Hijau**: *Actual* (Terlaksana)
*   **Merah**: *Missed* (Terlewat/Out of Schedule)
*   **Putih/Abu**: Tidak ada aktivitas

**Cara Mengubah:** Klik pada kotak bulan untuk mengganti statusnya secara berurutan (Kosong -> Plan -> Actual -> Missed -> Kosong).

### 5. Sinkronisasi Data
*   **Muat Ulang (Load)**: Klik tombol ikon **Refresh** (panah memutar) di toolbar atas untuk mengambil data terbaru dari Google Sheet berdasarkan periode tahun yang dipilih.
*   **Simpan (Save)**: Klik tombol **"Simpan ke Sheet"** untuk menulis perubahan yang Anda lakukan di aplikasi kembali ke Google Sheet.
    *   *Penting:* Perubahan di aplikasi bersifat lokal sementara sampai Anda menekan tombol Simpan.

### 6. Pengaturan & Tampilan
*   **Ganti Periode**: Klik tombol periode (misal "Periode: 2026") untuk memilih tahun data yang ingin ditampilkan.
*   **Dark Mode**: Klik ikon **Gear (Settings)** di header, lalu aktifkan toggle "Tampilan Aplikasi" untuk beralih ke mode gelap.
*   **Fullscreen**: Klik ikon Fullscreen di header untuk tampilan layar penuh yang lebih fokus.
*   **Sidebar**: Gunakan tombol panah di kiri atas untuk menyembunyikan/menampilkan sidebar menu perspektif.

---

**Versi Aplikasi:** 1.0.0
**Copyright:** © 2026 ARAYA. All Rights Reserved.