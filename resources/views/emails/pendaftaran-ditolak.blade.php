<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Informasi pendaftaran Dubes Communications</title>
</head>
<body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#172033;">
    <main style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;">
        <p style="margin:0;color:#1e3a5f;font-size:13px;font-weight:bold;letter-spacing:2px;">DUBES COMMUNICATIONS</p>
        <h1 style="margin:20px 0 12px;font-size:24px;">Pendaftaran kursus belum dapat disetujui</h1>
        <p style="font-size:15px;line-height:1.7;">Hai {{ $pendaftaran->nama_lengkap }}, pendaftaran kursus bahasa Inggris Anda di Dubes Communications belum dapat disetujui. Alasan penolakan:</p>
        <div style="margin:20px 0;padding:16px;border:1px solid #fecaca;border-radius:10px;background:#fff1f2;color:#991b1b;white-space:pre-line;">
            {{ $pendaftaran->catatan_verifikasi }}
        </div>
        <p style="font-size:15px;line-height:1.7;">Silakan buka formulir perbaikan melalui tombol di bawah, lalu perbaiki data dan kirim ulang. Anda tidak perlu mendaftar ulang dengan email baru.</p>
        <p style="margin:24px 0;">
            <a href="{{ $lanjutkanUrl }}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#0f1b2d;color:#fff;text-decoration:none;font-weight:bold;">Perbaiki Pendaftaran</a>
        </p>
        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">Tautan ini berlaku selama 7 hari. Setelah data diperbaiki dan bukti pembayaran dikirim ulang, pendaftaran Anda kembali menunggu verifikasi admin.</p>
    </main>
</body>
</html>
