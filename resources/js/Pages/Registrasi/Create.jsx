import { useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
/* ---------- ikon SVG inline (tanpa paket tambahan) ---------- */

const makeIcon = (paths) =>
  function Icon({ className = '' }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        {paths}
      </svg>
    );
  };

const GraduationCap = makeIcon(<><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></>);
const User = makeIcon(<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>);
const Calendar = makeIcon(<><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></>);
const Mail = makeIcon(<><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>);
const AtSign = makeIcon(<><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></>);
const KeyRound = makeIcon(<><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></>);
const ShieldCheck = makeIcon(<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>);
const Lock = makeIcon(<><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>);
const Eye = makeIcon(<><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></>);
const EyeOff = makeIcon(<><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" /><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" /><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" /><path d="m2 2 20 20" /></>);
const Wallet = makeIcon(<><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></>);
const Copy = makeIcon(<><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>);
const Check = makeIcon(<path d="M20 6 9 17l-5-5" />);
const CloudUpload = makeIcon(<><path d="M12 13v8" /><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="m8 17 4-4 4 4" /></>);
const UserPlus = makeIcon(<><path d="M2 21a8 8 0 0 1 13.292-6" /><circle cx="10" cy="8" r="5" /><path d="M19 16v6" /><path d="M22 19h-6" /></>);
const X = makeIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
const BadgeCheck = makeIcon(<><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></>);
const Headset = makeIcon(<><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" /><path d="M21 16v2a4 4 0 0 1-4 4h-5" /></>);
const MessageCircle = makeIcon(<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />);

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

/* ---------- potongan kecil yang dipakai berulang ---------- */

function Field({ label, required, optional, hint, error, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold text-[#0f1b2d]">
          {label}
          {optional && <span className="font-normal text-slate-600"> (Opsional)</span>}
          {required && <span className="ml-1 text-[#b91c1c]">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const box =
  'flex rounded-lg border bg-[#f4f7fc] focus-within:border-[#0f1b2d] focus-within:ring-2 focus-within:ring-[#0f1b2d]/10';
const inputCls =
  'w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none';

function IconInput({ icon: Icon, error, right, ...props }) {
  return (
    <div className={`${box} items-center gap-3 px-3.5 ${error ? 'border-red-400' : 'border-[#e6ebf5]'}`}>
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <input {...props} className={`${inputCls} py-3`} />
      {right}
    </div>
  );
}

function kekuatan(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const warnaMeter = ['bg-[#dbe4f5]', 'bg-red-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];
const labelMeter = ['Keamanan sandi', 'Lemah', 'Cukup', 'Baik', 'Kuat'];

/* ---------- kerangka halaman: navbar, latar, footer ---------- */

function Shell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f6fd]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* lingkaran blur dekoratif */}
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-blue-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-40 h-80 w-80 rounded-full bg-red-200/40 blur-3xl" />

      {/* navbar */}
      <header className="relative bg-white">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1b2d] text-lg font-bold text-white">D</div>
            <div className="leading-tight">
              <p className="text-xl font-extrabold tracking-tight text-[#0f1b2d]">DUBESIA</p>
              <p className="text-[10px] font-medium uppercase text-slate-500">Duta Bahasa<br />Edukasi</p>
            </div>
            <span className="ml-2 hidden text-sm text-slate-500 md:block">
              <span className="mr-1 text-slate-300">/</span>Portal Registrasi Calon Murid Baru
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-[#0f1b2d]">
            <a href="#" className="hidden md:block">Bantuan Admisi</a>
            <a href="#" className="hidden md:block">Panduan Pendaftaran</a>
            <Link href="/login" className="rounded-lg bg-[#eef3fd] px-4 py-2 font-semibold">Sudah Punya Akun? Masuk</Link>
            {/* ganti dengan logo/emblem asli jika ada */}
            <div className="hidden h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-[#1b2a41] md:flex">
              <span className="h-3 w-3 rounded-full bg-[#b91c1c]" />
            </div>
          </nav>
        </div>
      </header>

      <main className="relative px-4 pb-10 pt-8">{children}</main>

      {/* footer */}
      <footer className="relative mt-4 bg-[#eef3fd]">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-4 px-6 py-8 md:flex-row md:items-end">
          <div>
            <p className="text-lg text-[#0f1b2d]">
              <span className="font-extrabold">DUBESIA</span>
              <span className="ml-2 border-l border-slate-300 pl-2 text-[11px] text-slate-600">Portal Admisi Mahasiswa &amp; Calon Murid</span>
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Pusat Pelatihan &amp; Penguasaan Bahasa Internasional, Etiket Diplomatik, dan Retorika Semesta.
            </p>
          </div>
          <div className="flex gap-6 text-xs font-semibold text-[#0f1b2d]">
            <a href="#">Panduan Resmi</a>
            <a href="#">Hubungi Sekretariat</a>
          </div>
        </div>
        <div className="bg-[#e6edfb] py-3 text-center text-[11px] text-slate-600">
          © 2025 DUBESIA (Duta Bahasa Edukasi Semesta). Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
}

/* ---------- halaman utama ---------- */

export default function Create({ programs, biaya, rekening, sukses }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    nama_lengkap: '',
    tanggal_lahir: '',
    email: '',
    no_whatsapp: '',
    alamat: '',
    username: '',
    password: '',
    password_confirmation: '',
    pesan_motivasi: '',
    program: programs[0]?.value ?? '',
    bukti_pembayaran: null,
    setuju: false,
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [drag, setDrag] = useState(false);
  const [fileError, setFileError] = useState('');
  const [copied, setCopied] = useState(null);
  const fileRef = useRef(null);

  const skor = data.password ? kekuatan(data.password) : 0;

  const pilihFile = (f) => {
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(f.type)) {
      setFileError('Format harus JPG, PNG, atau PDF.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 5 MB.');
      return;
    }
    setFileError('');
    setData('bukti_pembayaran', f);
  };

  const salin = async (nomor) => {
    try {
      await navigator.clipboard.writeText(nomor.replace(/\D/g, ''));
      setCopied(nomor);
      setTimeout(() => setCopied(null), 1500);
    } catch (e) {
      /* clipboard tidak tersedia, abaikan */
    }
  };

  const submit = (e) => {
    e.preventDefault();
    post('/registrasi', {
      forceFormData: true,
      onSuccess: () => reset(),
    });
  };

  /* tampilan setelah berhasil submit */
  if (sukses) {
    return (
      <Shell>
        <Head title="Pendaftaran Terkirim" />
        <div className="mx-auto mt-10 max-w-[560px] rounded-2xl bg-white p-10 text-center shadow-[0_10px_40px_rgba(15,27,45,0.10)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <Check className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-[#0f1b2d]">Pendaftaran Terkirim</h1>
          <p className="mt-3 text-sm text-slate-600">{sukses}</p>
          <p className="mt-2 text-xs text-slate-500">
            Akun Anda akan aktif setelah Admin memverifikasi data dan bukti pembayaran.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Head title="Registrasi Calon Murid" />

      {/* banner gelombang admisi */}
      <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold text-[#0f1b2d] shadow-sm ring-1 ring-slate-200">
        <span className="h-2 w-2 rounded-full bg-[#b91c1c]" />
        Gelombang Admisi Semester Genap 2025/2026 Dibuka
      </div>

      <form onSubmit={submit} className="mx-auto max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(15,27,45,0.10)]">
        {/* header kartu */}
        <div className="relative bg-[#0f1b2d] px-8 pb-8 pt-7 text-white">
          <Link href="/" className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Tutup">
            <X className="h-4 w-4" />
          </Link>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-200">
            <GraduationCap className="h-4 w-4" /> Lembaga Bahasa &amp; Diplomasi Semesta
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Formulir Registrasi Calon Murid</h1>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
            Lengkapi data diri dan akun belajar Anda di Duta Bahasa Edukasi Semesta secara vertikal terstruktur.
          </p>
        </div>

        {/* isi form */}
        <div className="space-y-3 px-8 py-8">
          {errors.umum && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.umum}</div>}

          <Field label="Nama Lengkap Siswa" required hint="Sesuai KTP/Akta/Paspor" error={errors.nama_lengkap}>
            <IconInput icon={User} error={errors.nama_lengkap} placeholder="cth. Ahmad Rizky Pratama"
              value={data.nama_lengkap} onChange={(e) => setData('nama_lengkap', e.target.value)} />
          </Field>

          <Field label="Tanggal Lahir" required hint="Penentuan kelas usia" error={errors.tanggal_lahir}>
            <IconInput icon={Calendar} type="date" error={errors.tanggal_lahir}
              max={new Date().toISOString().slice(0, 10)}
              value={data.tanggal_lahir} onChange={(e) => setData('tanggal_lahir', e.target.value)} />
          </Field>

          <Field label="Alamat Email Aktif" required hint="Akses tautan verifikasi" error={errors.email}>
            <IconInput icon={Mail} type="email" error={errors.email} placeholder="nama@email.com"
              value={data.email} onChange={(e) => setData('email', e.target.value)} />
          </Field>

          <Field label="Nomor WhatsApp / Telepon" required hint="Untuk koordinasi tutor & jadwal" error={errors.no_whatsapp}>
            <div className={`${box} overflow-hidden ${errors.no_whatsapp ? 'border-red-400' : 'border-[#e6ebf5]'}`}>
              <span className="flex items-center bg-[#e4ecfb] px-4 text-xs font-bold text-[#0f1b2d]">+62</span>
              <input inputMode="numeric" placeholder="812 3456 7890" className={`${inputCls} px-4 py-3`}
                value={data.no_whatsapp} onChange={(e) => setData('no_whatsapp', e.target.value)} />
            </div>
          </Field>

          <Field label="Alamat Domisili Lengkap" required error={errors.alamat}>
            <div className={`${box} ${errors.alamat ? 'border-red-400' : 'border-[#e6ebf5]'}`}>
              <textarea rows={2} className={`${inputCls} resize-none px-3.5 py-3`}
                placeholder="Jalan, Nomor Rumah, RT/RW, Kecamatan, Kota/Kabupaten, Kode Pos..."
                value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} />
            </div>
          </Field>

          <p className="flex items-center gap-2 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <Lock className="h-3.5 w-3.5" /> Kredensial Portal Siswa DUBESIA
          </p>

          <Field label="Username Pembelajar" required error={errors.username}>
            <IconInput icon={AtSign} error={errors.username} placeholder="Pilih username untuk login (min. 5 karakter)"
              value={data.username} onChange={(e) => setData('username', e.target.value)} />
          </Field>

          <Field label="Kata Sandi (Password)" required hint="Minimal 8 karakter" error={errors.password}>
            <IconInput icon={KeyRound} type={showPw ? 'text' : 'password'} error={errors.password}
              placeholder="Buat kata sandi yang aman"
              value={data.password} onChange={(e) => setData('password', e.target.value)}
              right={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-500" aria-label="Tampilkan sandi">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              } />
            <div className="mt-2 flex items-center gap-2">
              <div className="grid flex-1 grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1 rounded-full ${i < skor ? warnaMeter[skor] : 'bg-[#dbe4f5]'}`} />
                ))}
              </div>
              <span className="text-[11px] text-slate-500">{labelMeter[skor]}</span>
            </div>
          </Field>

          <Field label="Konfirmasi Kata Sandi" required error={errors.password_confirmation}>
            <IconInput icon={ShieldCheck} type={showPw2 ? 'text' : 'password'} error={errors.password_confirmation}
              placeholder="Ketik ulang kata sandi Anda"
              value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
              right={
                <button type="button" onClick={() => setShowPw2(!showPw2)} className="text-slate-500" aria-label="Tampilkan sandi">
                  {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              } />
          </Field>

          <Field label="Pesan / Motivasi Belajar" optional hint="Kebutuhan spesifik" error={errors.pesan_motivasi}>
            <div className={`${box} border-[#e6ebf5]`}>
              <textarea rows={3} className={`${inputCls} resize-none px-3.5 py-3`}
                placeholder="Tuliskan pesan atau motivasi belajar bahasa Anda (misal: persiapan beasiswa LPDP, konferensi internasional, sertifikasi karier, dll)..."
                value={data.pesan_motivasi} onChange={(e) => setData('pesan_motivasi', e.target.value)} />
            </div>
          </Field>

          {/* pilihan program */}
          <div className="pt-3">
            <p className="mb-2 text-sm font-semibold text-[#0f1b2d]">
              Pilihan Program Kursus Perdana<span className="ml-1 text-[#b91c1c]">*</span>
            </p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {programs.map((p) => (
                <label key={p.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg bg-[#eef3fd] p-3 ${data.program === p.value ? 'ring-1 ring-[#0f1b2d]/40' : ''}`}>
                  <input type="radio" name="program" value={p.value} checked={data.program === p.value}
                    onChange={() => setData('program', p.value)} className="mt-1 accent-[#0f1b2d]" />
                  <span>
                    <span className="block text-[13px] font-bold text-[#0f1b2d]">{p.label}</span>
                    <span className="block text-xs text-slate-600">{p.deskripsi}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.program && <p className="mt-1.5 text-xs text-red-600">{errors.program}</p>}
          </div>

          {/* biaya + rekening + upload */}
          <div className="rounded-xl bg-[#eef3fd] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[13px] font-bold text-[#0f1b2d]">
                <Wallet className="h-4 w-4 text-[#b91c1c]" /> Biaya Pendaftaran &amp; Diagnostic Placement Test
              </p>
              <p className="whitespace-nowrap text-lg font-extrabold text-[#b91c1c]">{rupiah(biaya)}</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Biaya sudah termasuk Placement Assessment eksklusif, buku panduan digital DUBESIA, serta aktivasi akun portal
              seumur hidup. Silakan transfer ke salah satu rekening resmi di bawah:
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rekening.map((r) => (
                <div key={r.bank} className="flex items-start justify-between gap-2 rounded-lg bg-white p-3 shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">{r.bank}</p>
                    <p className="mt-0.5 text-lg font-extrabold tracking-tight text-[#0f1b2d]">{r.nomor}</p>
                    <p className="text-[10px] text-slate-500">a.n. {r.atas_nama}</p>
                  </div>
                  <button type="button" onClick={() => salin(r.nomor)} className="mt-1 text-slate-400 hover:text-slate-700" aria-label="Salin nomor rekening">
                    {copied === r.nomor ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs font-bold text-[#0f1b2d]">
              Unggah Bukti Transfer <span className="text-[#b91c1c]">*</span>
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pilihFile(e.dataTransfer.files[0]); }}
              className={`mt-2 rounded-lg bg-white px-4 py-6 text-center ${drag ? 'ring-2 ring-[#b91c1c]/40' : ''}`}>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
                onChange={(e) => pilihFile(e.target.files[0])} />
              <CloudUpload className="mx-auto h-8 w-8 text-[#b91c1c]" />
              {data.bukti_pembayaran ? (
                <p className="mt-2 text-sm font-semibold text-[#0f1b2d]">
                  {data.bukti_pembayaran.name}{' '}
                  <button type="button" onClick={() => { setData('bukti_pembayaran', null); if (fileRef.current) fileRef.current.value = ''; }}
                    className="ml-1 text-xs font-medium text-[#b91c1c] underline">Hapus</button>
                </p>
              ) : (
                <p className="mt-2 text-[13px] font-semibold text-[#0f1b2d]">
                  Tarik &amp; lepas file bukti transfer atau{' '}
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-[#b91c1c] underline">Cari File</button>
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-500">Format: JPG, PNG, atau PDF (Maks. 5 MB)</p>
            </div>
            {(fileError || errors.bukti_pembayaran) && (
              <p className="mt-1.5 text-xs text-red-600">{fileError || errors.bukti_pembayaran}</p>
            )}
          </div>

          {/* persetujuan */}
          <div className="pt-2">
            <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-[#0f1b2d]">
              <input type="checkbox" checked={data.setuju} onChange={(e) => setData('setuju', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0f1b2d]" />
              <span>
                Saya menyatakan bahwa data yang saya masukkan adalah benar dan sah. Saya telah membaca serta menyetujui
                seluruh <a href="#" className="font-medium text-[#b91c1c]">Syarat &amp; Ketentuan Akademik</a> dan{' '}
                <a href="#" className="font-medium text-[#b91c1c]">Kebijakan Privasi</a> DUBESIA.
              </span>
            </label>
            {errors.setuju && <p className="mt-1.5 text-xs text-red-600">{errors.setuju}</p>}
          </div>

          <button type="submit" disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f1b2d] py-3.5 text-sm font-bold text-white hover:bg-[#16263d] disabled:opacity-60">
            <UserPlus className="h-4 w-4" />
            {processing ? 'Mengirim...' : 'Daftar Sekarang (Register)'}
          </button>

          <p className="pt-2 text-center text-xs text-slate-600">
            Sudah memiliki akun portal?{' '}
            <Link href="/login" className="font-bold text-[#b91c1c]">Masuk di sini</Link>
          </p>
        </div>
      </form>

      {/* tiga kartu informasi */}
      <div className="mx-auto mt-5 grid max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-[#b91c1c]"><BadgeCheck className="h-5 w-5" /></span>
          <div><p className="text-[13px] font-bold text-[#0f1b2d]">Terakreditasi A</p><p className="text-[10px] text-slate-500">Standar Bahasa &amp; Retorika Internasional</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Headset className="h-5 w-5" /></span>
          <div><p className="text-[13px] font-bold text-[#0f1b2d]">Layanan Admisi Siaga</p><p className="text-[10px] text-slate-500">Verifikasi berkas &lt; 24 jam kerja</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700"><MessageCircle className="h-5 w-5" /></span>
          <div><p className="text-[13px] font-bold text-[#0f1b2d]">Bantuan WhatsApp</p><a href="#" className="text-[10px] font-bold text-[#b91c1c]">Hubungi Sekretariat Admisi →</a></div>
        </div>
      </div>
    </Shell>
  );
}