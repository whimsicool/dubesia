<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Akun tutor Dubes Communications</title>
</head>
<body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#172033;">
    <main style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;">
        <p style="margin:0;color:#1e3a5f;font-size:13px;font-weight:bold;letter-spacing:2px;">DUBES COMMUNICATIONS</p>
        <h1 style="margin:20px 0 12px;font-size:24px;">Akun tutor Anda sudah dibuat</h1>
        <p style="font-size:15px;line-height:1.7;">Hai {{ $tutor->name }}, akun tutor Anda di portal DUBESIA sudah aktif. Gunakan kredensial berikut untuk masuk:</p>
        <div style="margin:20px 0;padding:16px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;">
            <p style="margin:0 0 8px;"><strong>Email:</strong> {{ $tutor->email }}</p>
            <p style="margin:0;"><strong>Kata sandi:</strong> {{ $password }}</p>
        </div>
        <p style="font-size:15px;line-height:1.7;">Segera ganti kata sandi melalui halaman <strong>Profil</strong> setelah berhasil masuk.</p>
        <p style="margin:24px 0;">
            <a href="{{ route('login') }}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#0f1b2d;color:#fff;text-decoration:none;font-weight:bold;">Masuk ke DUBESIA</a>
        </p>
        <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">Jika Anda tidak merasa dibuatkan akun, abaikan email ini dan hubungi administrator.</p>
    </main>
</body>
</html>
