# MODU — A Small Possibility

Prototype RPG eksplorasi top-down, HTML/CSS/JavaScript tanpa library eksternal.
Durasi sekitar 5–10 menit. Bahasa dialog: Indonesia.

## Cara bermain lokal

1. Ekstrak seluruh `MODU-RPG-Offline.zip`.
2. Buka `modu-rpg/index.html` di browser desktop modern (Chrome, Edge, Safari, Firefox).
3. Klik **Masuk The Grid**.

Alternatif paling praktis: buka `MODU-RPG-Standalone.html`. Seluruh kode dan sprite sudah tertanam di dalamnya, tidak memerlukan folder assets, instalasi, server, ataupun internet.

Bila kebijakan browser memblokir file lokal, gunakan server lokal pilihanmu di folder ini. Contoh bagi pengguna Python: `python3 -m http.server 8000 --bind 127.0.0.1`, lalu buka `http://127.0.0.1:8000`. Tidak ada kebutuhan mengunggah atau memublikasikan game.

## Kontrol

- WASD / tombol panah: berjalan.
- E: bicara, periksa objek, ambil barang, atau naik ke kotak.
- Setelah OBJECT 07 diperiksa: berjalan ke arah kotak untuk mendorongnya.
- I / tombol SLING BAG: inventory.
- Esc / tombol ?: bantuan. Esc menutup dialog aktif.
- Tombol arah dan interaksi tampil pada perangkat layar sentuh.
- Tombol Mulai ulang meminta konfirmasi sebelum mengganti progres.
- Bila kotak tersangkut, gunakan **? → Reset posisi kotak** kapan saja.

Progres disimpan otomatis di browser bila localStorage tersedia. Mode privat, kebijakan browser, atau pemindahan file bisa memengaruhi penyimpanan. Game tetap bisa dimainkan dalam satu sesi tanpa penyimpanan.

## Isi

Eksplorasi Sector 07, dua NPC tanpa wajah, dialog kontekstual, puzzle kotak fisik dengan tabrakan, quest kartu arsip, quest opsional stempel rute, inventory, autosave, dan ending singkat. Setelah ending, kamu bisa menjelajah lagi.

Karakter menggunakan sprite render 3D berdasarkan desain MODU final; dunia dan pergerakan memakai Canvas 2D. Ini bukan model 3D realtime atau animasi skeletal. Sprite arah kiri mencerminkan tampilan profil; jalan menggunakan perpindahan dan bob ringan, bukan walk cycle lengkap.

## Worldbuilding

THE GRID = ORDER. MODU = POSSIBILITY.
GRID aman, teratur, dan fungsional. MODU menambah kemungkinan tanpa menghancurkan sistem.
NPC off-white tanpa mata, hidung, atau mulut. Merah dipakai pada identitas MODU dan penemuan kemungkinan. Alur cerita: RULE → QUESTION → POSSIBILITY → CHANGE.

## Panduan solusi (spoiler)

1. Bicara dengan petugas arsip di plaza barat, koordinat 06:08.
2. Cari OBJECT 07 di 16:08, lalu tekan E.
3. Berdiri di selatan kotak, 16:09. Dorong dua kali ke utara.
4. Berjalan memutar ke sisi barat kotak, 15:06. Dorong dua kali ke timur.
5. Kotak berada di tanda 18:06, tepat di depan rak. Tekan E di dekat kotak untuk naik dan mengambil kartu.
6. Kembali ke petugas arsip. Kartu ditukar dengan izin akses dan catatan fungsi baru.
7. Pergi ke terminal arsip di 21:06 dan tekan E untuk ending.

Opsional: ambil stempel di 04:05, lalu berikan kepada penjaga jalur di 11:05 untuk mendapatkan catatan tambahan.

## Validasi

- JavaScript diperiksa sintaksnya.
- `test-engine.cjs` memverifikasi rute berjalan sebenarnya, collision, puzzle, kartu, inventory, quest opsional, syarat ending, save/load, dan reset.
- `test-ui.cjs` menjalankan smoke test kode UI dengan DOM/Canvas tiruan; bukan verifikasi visual browser.
- Pemeriksaan visual browser belum selesai: browser otomatis tidak dapat diluncurkan di lingkungan ini, dan browser dalam aplikasi menolak URL file lokal berdasarkan kebijakan keamanan.

Pengujian logika: `node test-engine.cjs`. Pengujian integrasi UI: `node test-ui.cjs`.

## Struktur

- index.html — halaman game
- style.css — tampilan responsif
- engine.js — aturan permainan dan state
- game.js — Canvas, keyboard, dialog, UI, dan save
- assets/characters.png — atlas transparan sprite MODU/NPC
- assets/reference-modu.png dan reference-world.png — halaman referensi asli dari deck final
- ASSETS.md — sumber aset dan prompt produksi

Seluruh file referensi proyek asli tetap tidak berubah. Tidak ada analytics, jaringan eksternal, login, atau CDN.
