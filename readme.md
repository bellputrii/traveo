
-----

# ✈️ Traveo — Travel Article Management Platform

[](https://www.google.com/search?q=https://traveo.vercel.app)
[](https://nextjs.org/)
[](https://extra-brooke-yeremiadio-46b2183e.koyeb.app)

**Traveo** adalah solusi *Content Management System* (CMS) modern yang berfokus pada manajemen konten artikel perjalanan. Dibangun menggunakan **Next.js 15** dan pola arsitektur **Redux** untuk manajemen *state* yang *reliable*, Traveo menawarkan antarmuka pengguna yang cepat, *scalable*, dan berinteraksi secara *seamless* dengan API backend eksternal.

Platform ini memberdayakan penulis dan admin untuk mengelola konten, kategori, dan interaksi komunitas (komentar) secara efisien.

-----

## 🔗 Live Deployment

Proyek ini telah dideploy dan tersedia untuk publik di tautan berikut:

**🌐 [traveo-eight.vercel.app](https://traveo-eight.vercel.app/)**

-----

## ✨ Fitur Utama

Traveo menyediakan serangkaian fitur lengkap untuk pengelolaan konten:

| Kategori | Fitur | Deskripsi |
| :--- | :--- | :--- |
| **Artikel** | **CRUD Artikel** | Operasi lengkap (Create, Read, Update, Delete) untuk artikel perjalanan, termasuk editor teks yang kaya fitur. |
| **Struktur** | **CRUD Kategori** | Manajemen kategori artikel untuk pengorganisasian konten yang logis. |
| **Komunitas** | **CRUD Komentar** | Mengelola komentar pada setiap artikel untuk memfasilitasi interaksi pengguna. |
| **Media** | **Upload Gambar** | Integrasi pengunggahan gambar yang dibutuhkan untuk *thumbnail* dan konten artikel. |
| **Pengguna** | **Manajemen Profil** | Pengguna dapat memperbarui detail profil seperti nama, email, dan foto profil. |

-----

## 📐 Arsitektur & Teknologi

Traveo menerapkan arsitektur *frontend-centric* dengan *state management* yang ketat, memastikan pemisahan tanggung jawab yang jelas.

### 1\. Frontend & State Management

Kami menggunakan pola **Redux Pattern** untuk mengelola *state* aplikasi.

  * **Framework:** Next.js 15 (TypeScript)
  * **State Management:** Redux Toolkit (RTK)
      * Menggunakan **RTK Query** untuk menangani *data fetching, caching*, dan *state* asinkronus dengan efisiensi tinggi, mengurangi kebutuhan akan *boilerplate* Redux.
  * **Styling:** Tailwind CSS, Radix UI, dan Shadcn/ui untuk komponen yang *headless* dan *accessible*.

### 2\. Backend (API External)

Aplikasi *frontend* berinteraksi secara eksklusif dengan *Rest API* eksternal.

  * **Endpoint API:** `https://extra-brooke-yeremiadio-46b2183e.koyeb.app`
  * **Interaksi:** Menggunakan **Axios** dan **RTK Query** untuk komunikasi data melalui *JSON*.

### 3\. Pengembangan & Kualitas Kode

  * **Monorepo Tooling:** Turbopack (Digunakan oleh Next.js 15).
  * **Linting & Formatting:** ESLint dan Prettier.
  * **Commit Management:** Husky dan Commitlint untuk menegakkan konvensi pesan commit profesional.

-----

## 🛠️ Panduan Pengembangan Lokal

Ikuti langkah-langkah ini untuk menjalankan proyek secara lokal.

### 1\. Clone Repositori

```bash
git clone https://github.com/username/traveo-web.git
cd traveo-web
```

### 2\. Instalasi Dependensi

```bash
npm install
# atau
yarn install
```

### 3\. Konfigurasi Lingkungan

Buat file `.env.local` di root direktori dan tambahkan URL API eksternal:

```env
# Variabel yang diakses di browser
NEXT_PUBLIC_API_URL=https://extra-brooke-yeremiadio-46b2183e.koyeb.app

# Tambahkan kunci API atau token rahasia lainnya di sini
```

### 4\. Jalankan Server Pengembangan

```bash
npm run dev
# atau
yarn dev
```

Aplikasi akan tersedia di `http://localhost:3000`.

-----

## 🚀 Deployment

| Lingkungan | Platform | Tautan | Keterangan |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | [traveo-eight.vercel.app](https://www.google.com/search?q=https://traveo-eight.vercel.app) | Memanfaatkan fitur SSR/SSG/ISR Next.js untuk performa optimal. |
| **Backend API** | Koyeb | `https://extra-brooke-yeremiadio-46b2183e.koyeb.app` | Dikelola secara independen dari proyek ini. |

-----

## 📜 Lisensi

Proyek ini dilindungi oleh lisensi pribadi. Dilarang memperbanyak, menyalin, atau mendistribusikan ulang kode tanpa izin resmi dari pemilik proyek.