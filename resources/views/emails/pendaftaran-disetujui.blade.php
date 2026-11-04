<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pendaftaran berhasil</title>
</head>
<body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#172033;">
    <main style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;">
        <p style="margin:0;color:#1e3a5f;font-size:13px;font-weight:bold;letter-spacing:2px;">DUBES COMMUNICATIONS</p>
        <h1 style="margin:20px 0 12px;font-size:24px;">Pendaftaran Anda berhasil</h1>
        <p style="font-size:15px;line-height:1.7;">Hai {{ $pendaftaran->nama_lengkap }}, pendaftaran kursus bahasa Inggris Anda di Dubes Communications telah disetujui. Selamat bergabung!</p>
        <p style="font-size:15px;line-height:1.7;">Masuk ke portal DUBESIA memakai email <strong>{{ $pendaftaran->email }}</strong> dan kata sandi yang Anda buat saat mendaftar.</p>
        <p style="margin:24px 0;">
            <a href="{{ route('login') }}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#0f1b2d;color:#fff;text-decoration:none;font-weight:bold;">Masuk ke DUBESIA</a>
        </p>
        <p style="font-size:15px;line-height:1.7;">Kuitansi pembayaran terlampir dalam bentuk PDF. Mohon simpan sebagai referensi transaksi Anda. Jika lupa kata sandi, gunakan menu <strong>Lupa kata sandi</strong> pada halaman masuk.</p>
        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">Jika Anda tidak merasa mendaftar, abaikan email ini dan hubungi administrator.</p>
    </main>
</body>
</html>
