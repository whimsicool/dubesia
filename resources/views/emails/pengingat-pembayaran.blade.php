<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lanjutkan pembayaran pendaftaran</title>
</head>
<body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#172033;">
    <main style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;">
        <p style="margin:0;color:#1e3a5f;font-size:13px;font-weight:bold;letter-spacing:2px;">DUBES COMMUNICATIONS</p>
        <h1 style="margin:20px 0 12px;font-size:24px;">Satu langkah lagi, {{ $pendaftaran->nama_lengkap }}</h1>
        <p style="font-size:15px;line-height:1.7;">Pendaftaran Anda pada program <strong>{{ $programLabel }}</strong> sudah tersimpan. Pembayaran belum kami terima, jadi akun Anda belum aktif.</p>
        <div style="margin:20px 0;padding:16px;border:1px solid #fde68a;border-radius:10px;background:#fffbeb;">
            <p style="margin:0;font-size:15px;">Biaya kursus: <strong>Rp {{ number_format((int) $pendaftaran->biaya, 0, ',', '.') }}</strong></p>
        </div>
        <p style="font-size:15px;line-height:1.7;">Masuk ke akun Anda untuk melihat rekening tujuan transfer dan mengunggah bukti pembayaran. Data Anda tetap tersimpan, dan pembayaran bisa dilanjutkan kapan saja.</p>
        <p style="margin:24px 0;">
            <a href="{{ route('pembayaran.show') }}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#0f1b2d;color:#fff;text-decoration:none;font-weight:bold;">Lanjutkan Pembayaran</a>
        </p>
        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">Jika Anda sudah membayar, abaikan email ini dan tunggu verifikasi admin.</p>
    </main>
</body>
</html>
