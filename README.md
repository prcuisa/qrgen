# QRcraft — QR Code Generator Full Fitur

Generator QR code lengkap, berjalan **100% di browser** (client-side). Tidak butuh backend, tidak ada data yang dikirim ke server — cocok untuk deploy **static di Vercel** (gratis, tanpa maintenance).

## Fitur

**10 tipe konten**
URL · Teks · Email · Telepon · SMS · WhatsApp · WiFi · vCard (kontak) · Lokasi (GPS) · Event (kalender)

**Kustomisasi**
- Bentuk piksel: kotak, bulat, titik, extra-rounded, classy, classy-rounded
- Gaya sudut (finder pattern) terpisah untuk kotak & titik
- Warna solid atau **gradien** (linear/radial)
- Latar solid atau transparan
- Upload **logo** di tengah + atur ukuran & sembunyikan piksel di baliknya
- Ukuran (160–1024 px), margin (quiet zone), level koreksi error (L/M/Q/H)
- 6 preset cepat: Klasik, Bulat, Titik, Neon, Sunset, Mono

**Ekspor**
Unduh **PNG · SVG · JPEG · WebP**, atau salin gambar langsung ke clipboard.

## Struktur file

```
qr-generator/
├── index.html      # Struktur & UI
├── styles.css      # Tema
├── app.js          # Logika QR
├── vercel.json     # Konfigurasi Vercel (opsional)
└── README.md
```

Library QR (`qr-code-styling`) dimuat via CDN jsDelivr, jadi tidak ada dependency yang perlu di-install.

## Cara deploy ke Vercel

### Opsi A — Drag & drop (paling cepat)
1. Buka https://vercel.com dan login.
2. Klik **Add New → Project**.
3. Seret folder `qr-generator` ini ke area upload (atau pakai Vercel CLI).
4. Klik **Deploy**. Selesai — situs langsung online.

### Opsi B — Lewat GitHub (disarankan untuk update)
1. Push folder ini ke sebuah repo GitHub.
2. Di Vercel: **Add New → Project → Import** repo tersebut.
3. Framework Preset: pilih **Other** (ini situs static, tanpa build step).
4. Build Command & Output Directory: kosongkan.
5. Klik **Deploy**.

### Opsi C — Vercel CLI
```bash
npm i -g vercel
cd qr-generator
vercel        # deploy preview
vercel --prod # deploy production
```

## Menjalankan lokal

Karena murni static, cukup buka `index.html` di browser. Untuk pengalaman paling mirip production:
```bash
cd qr-generator
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Catatan privasi
Seluruh proses generate QR terjadi di perangkat pengguna. Logo yang diunggah pun tidak pernah keluar dari browser. Tidak ada tracking dan tidak ada API server.
