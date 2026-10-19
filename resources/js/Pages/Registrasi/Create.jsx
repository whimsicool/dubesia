
import { useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

const rupiah = (value) =>
  `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const inputClass =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-dubesia-red focus:ring-2 focus:ring-dubesia-red/10';

function Field({ label, required = false, hint, error, children }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <label className="text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="ml-1 text-rose-600">*</span>}
        </label>

        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>

      {children}

      {error && (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div className="mb-5 border-b border-slate-100 pb-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>

      {description && (
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Head title="Registrasi Calon Murid | DUBESIA">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo DUBESIA hanya tampilan, tidak bisa diklik */}
          <div className="flex min-w-0 items-center gap-3" aria-label="DUBESIA">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg font-extrabold text-white">
              D
            </span>

            <span className="min-w-0 leading-tight">
              <span className="block text-lg font-extrabold tracking-tight text-slate-900">
                DUBESIA
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Duta Bahasa Edukasi
              </span>
            </span>
          </div>

          <nav className="flex items-center gap-2 text-sm sm:gap-5">
            <Link
              href="/bantuan-admisi"
              className="hidden text-slate-600 transition hover:text-dubesia-red md:inline"
            >
              Bantuan Admisi
            </Link>

            <Link
              href="/panduan-pendaftaran"
              className="hidden text-slate-600 transition hover:text-dubesia-red md:inline"
            >
              Panduan Pendaftaran
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-dubesia-navy px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-dubesia-red sm:px-4 sm:text-sm"
            >
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        {children}
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-extrabold text-slate-900">
              DUBESIA
              <span className="ml-2 border-l border-slate-300 pl-2 text-xs font-medium text-slate-500">
                Portal Admisi Calon Murid
              </span>
            </p>

            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
              Pusat Pelatihan dan Penguasaan Bahasa Internasional, Etiket
              Diplomatik, dan Retorika Semesta.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <Link
              href="/panduan-pendaftaran"
              className="hover:text-dubesia-red"
            >
              Panduan Pendaftaran
            </Link>

            <Link href="/bantuan-admisi" className="hover:text-dubesia-red">
              Bantuan Admisi
            </Link>
          </div>
        </div>

        <div className="bg-slate-100 px-4 py-3 text-center text-xs leading-5 text-slate-500">
          © {new Date().getFullYear()} DUBESIA (Duta Bahasa Edukasi Semesta).
          Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
}

export default function Create({
  programs = [],
  rekening = [],
  sukses,
}) {
  const { data, setData, post, processing, errors } = useForm({
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

  const programTerpilih = programs.find(
    (program) => program.value === data.program,
  );
  const biayaTerpilih = programTerpilih?.biaya ?? 0;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [copied, setCopied] = useState('');

  const fileInput = useRef(null);

  const passwordStrength = [
    data.password.length >= 8,
    /[a-z]/.test(data.password) && /[A-Z]/.test(data.password),
    /\d/.test(data.password),
    /[^A-Za-z0-9]/.test(data.password),
  ].filter(Boolean).length;

  const strengthLabels = ['Belum diisi', 'Lemah', 'Cukup', 'Baik', 'Kuat'];

  const strengthColors = [
    'bg-slate-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-emerald-600',
  ];

  const chooseFile = (file) => {
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError('Format file harus JPG, PNG, atau PDF.');
      setData('bukti_pembayaran', null);

      if (fileInput.current) fileInput.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 5 MB.');
      setData('bukti_pembayaran', null);

      if (fileInput.current) fileInput.current.value = '';
      return;
    }

    setFileError('');
    setData('bukti_pembayaran', file);
  };

  const copyAccount = async (number) => {
    try {
      await navigator.clipboard.writeText(
        String(number).replace(/\D/g, ''),
      );

      setCopied(number);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setFileError(
        'Nomor rekening tidak dapat disalin otomatis. Silakan salin secara manual.',
      );
    }
  };

  const submit = (event) => {
    event.preventDefault();

    post('/registrasi', {
      forceFormData: true,
    });
  };

  if (sukses) {
    return (
      <Shell>
        <Head title="Pendaftaran Terkirim | DUBESIA" />

        <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl font-bold text-emerald-600">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Pendaftaran Terkirim
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">{sukses}</p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Akun Anda akan aktif setelah Admin memverifikasi data dan bukti
            pembayaran.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-lg bg-dubesia-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-dubesia-red"
          >
            Kembali ke halaman masuk
          </Link>
        </section>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-dubesia-navy via-dubesia-navy to-dubesia-red px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-dubesia-gold-light">
          Pendaftaran Calon Murid
        </p>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Formulir Registrasi Calon Murid
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100">
          Lengkapi data diri Anda untuk menjadi bagian dari DUBESIA. Bersama
          kami, wujudkan masa depan global Anda.
        </p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.95fr)]">
        <form
          id="form-registrasi"
          onSubmit={submit}
          className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7"
        >
          {errors.umum && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {errors.umum}
            </div>
          )}

          <section>
            <SectionTitle
              title="Data Diri"
              description="Masukkan informasi pribadi yang benar dan masih aktif."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" required error={errors.nama_lengkap}>
                <input
                  required
                  autoComplete="name"
                  className={inputClass}
                  value={data.nama_lengkap}
                  onChange={(e) => setData('nama_lengkap', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </Field>

              <Field
                label="Tanggal Lahir"
                required
                error={errors.tanggal_lahir}
              >
                <input
                  required
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                  value={data.tanggal_lahir}
                  onChange={(e) => setData('tanggal_lahir', e.target.value)}
                />
              </Field>

              <Field label="Email" required error={errors.email}>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="nama@email.com"
                />
              </Field>

              <Field
                label="Nomor WhatsApp"
                required
                hint="Gunakan nomor aktif"
                error={errors.no_whatsapp}
              >
                <div className="flex min-w-0 rounded-lg border border-slate-200 focus-within:border-dubesia-red focus-within:ring-2 focus-within:ring-dubesia-red/10">
                  <span className="flex items-center rounded-l-lg bg-slate-100 px-3 text-sm font-semibold text-slate-600">
                    +62
                  </span>

                  <input
                    required
                    inputMode="tel"
                    autoComplete="tel-national"
                    className="min-w-0 flex-1 rounded-r-lg px-3 py-3 text-sm outline-none"
                    value={data.no_whatsapp}
                    onChange={(e) => setData('no_whatsapp', e.target.value)}
                    placeholder="81234567890"
                  />
                </div>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Alamat Lengkap" required error={errors.alamat}>
                  <textarea
                    required
                    rows={3}
                    className={`${inputClass} resize-y`}
                    value={data.alamat}
                    onChange={(e) => setData('alamat', e.target.value)}
                    placeholder="Jalan, nomor rumah, RT/RW, kecamatan, kota/kabupaten, kode pos..."
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-slate-100 pt-6">
            <SectionTitle
              title="Informasi Akun"
              description="Informasi ini akan digunakan untuk masuk ke portal DUBESIA."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Username"
                required
                hint="Minimal 5 karakter"
                error={errors.username}
              >
                <input
                  required
                  minLength={5}
                  autoComplete="username"
                  className={inputClass}
                  value={data.username}
                  onChange={(e) => setData('username', e.target.value)}
                  placeholder="Buat username"
                />
              </Field>

              <Field
                label="Kata Sandi"
                required
                hint="Minimal 8 karakter"
                error={errors.password}
              >
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${inputClass} pr-20`}
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Buat kata sandi"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                      className="absolute inset-y-0 right-3 text-xs font-semibold text-dubesia-red"
                  >
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>

                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3].map((part) => (
                    <span
                      key={part}
                      className={`h-1.5 flex-1 rounded-full ${
                        part < passwordStrength
                          ? strengthColors[passwordStrength]
                          : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {strengthLabels[data.password ? passwordStrength : 0]}
                </p>
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Konfirmasi Kata Sandi"
                  required
                  error={errors.password_confirmation}
                >
                  <div className="relative">
                    <input
                      required
                      type={showConfirmation ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`${inputClass} pr-20`}
                      value={data.password_confirmation}
                      onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                      }
                      placeholder="Ketik ulang kata sandi"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmation((value) => !value)
                      }
                    className="absolute inset-y-0 right-3 text-xs font-semibold text-dubesia-red"
                    >
                      {showConfirmation ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </Field>
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-slate-100 pt-6">
            <SectionTitle
              title="Program Kursus"
              description="Pilih program yang ingin Anda ikuti."
            />

            <Field label="Pilihan Program" required error={errors.program}>
              <div className="grid gap-3 sm:grid-cols-2">
                {programs.map((program) => (
                  <label
                    key={program.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      data.program === program.value
                        ? 'border-dubesia-red bg-dubesia-red-soft ring-1 ring-dubesia-red/20'
                        : 'border-slate-200 hover:border-dubesia-gold'
                    }`}
                  >
                    <input
                      required
                      type="radio"
                      name="program"
                      value={program.value}
                      checked={data.program === program.value}
                      onChange={() => setData('program', program.value)}
                      className="mt-1 accent-dubesia-red"
                    />

                    <span>
                      <span className="block text-sm font-bold text-slate-900">
                        {program.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {program.deskripsi}
                      </span>
                      <span className="mt-2 block text-sm font-semibold text-dubesia-navy">
                        {rupiah(program.biaya)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="mt-4 rounded-xl border-l-4 border-dubesia-gold bg-dubesia-navy-soft p-4 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Biaya Pendaftaran
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Periksa informasi pembayaran sebelum mengirim formulir.
                </p>
              </div>

              <p className="mt-2 text-2xl font-extrabold text-dubesia-navy sm:mt-0">
                {rupiah(biayaTerpilih)}
              </p>
            </div>
          </section>

          <section className="mt-8 border-t border-slate-100 pt-6">
            <SectionTitle
              title="Bukti Pembayaran"
              description="Format JPG, PNG, atau PDF dengan ukuran maksimal 5 MB."
            />

            <Field
              label="Upload Bukti Pembayaran"
              required
              error={fileError || errors.bukti_pembayaran}
            >
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  chooseFile(event.dataTransfer.files?.[0]);
                }}
                className={`rounded-xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                  dragging
                    ? 'border-dubesia-red bg-dubesia-red-soft'
                    : 'border-slate-200 bg-slate-50 hover:border-dubesia-gold'
                }`}
              >
                <input
                  ref={fileInput}
                  required={!data.bukti_pembayaran}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="sr-only"
                  onChange={(event) =>
                    chooseFile(event.target.files?.[0])
                  }
                />

                <div className="text-3xl text-dubesia-red">↑</div>

                {data.bukti_pembayaran ? (
                  <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                    {data.bukti_pembayaran.name}
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    Seret file ke sini atau pilih dari perangkat
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG, atau PDF · Maksimal 5 MB
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="rounded-lg bg-dubesia-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-dubesia-red"
                  >
                    Pilih File
                  </button>

                  {data.bukti_pembayaran && (
                    <button
                      type="button"
                      onClick={() => {
                        setData('bukti_pembayaran', null);
                        setFileError('');
                        if (fileInput.current) fileInput.current.value = '';
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Hapus File
                    </button>
                  )}
                </div>
              </div>
            </Field>
          </section>

          <section className="mt-8 border-t border-slate-100 pt-6">
            <Field
              label="Pesan / Motivasi Belajar"
              hint="Opsional"
              error={errors.pesan_motivasi}
            >
              <textarea
                rows={3}
                className={`${inputClass} resize-y`}
                value={data.pesan_motivasi}
                onChange={(e) => setData('pesan_motivasi', e.target.value)}
                placeholder="Ceritakan alasan atau motivasi Anda mengikuti program ini..."
              />
            </Field>

            <div className="mt-5">
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
                <input
                  required
                  type="checkbox"
                  checked={data.setuju}
                  onChange={(e) => setData('setuju', e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-dubesia-red"
                />

                <span>
                  Saya menyatakan bahwa data yang diberikan benar dan
                  menyetujui ketentuan serta kebijakan privasi DUBESIA.
                </span>
              </label>

              {errors.setuju && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.setuju}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-dubesia-navy px-5 py-3.5 text-sm font-bold text-white transition hover:bg-dubesia-red disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? 'Mengirim pendaftaran...' : 'Daftar Sekarang'}
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-semibold text-dubesia-red hover:underline">
                Masuk di sini
              </Link>
            </p>
          </section>
        </form>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">
              Informasi Pembayaran
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Transfer biaya pendaftaran ke salah satu rekening resmi berikut.
            </p>

            <p className="mt-4 text-2xl font-extrabold text-dubesia-navy">
              {rupiah(biayaTerpilih)}
            </p>

            <div className="mt-4 space-y-3">
              {rekening.map((account) => (
                <div
                  key={`${account.bank}-${account.nomor}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {account.bank}
                  </p>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="break-all text-lg font-extrabold text-slate-900">
                      {account.nomor}
                    </p>

                    <button
                      type="button"
                      onClick={() => copyAccount(account.nomor)}
                      className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-dubesia-navy hover:border-dubesia-gold hover:bg-dubesia-gold-soft"
                    >
                      {copied === account.nomor ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    a.n. {account.atas_nama}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-dubesia-gold/40 bg-dubesia-gold-soft p-5 sm:p-6">
            <h2 className="font-bold text-dubesia-navy">Data Anda Aman</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Data pendaftaran digunakan untuk proses administrasi dan
              verifikasi oleh DUBESIA.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">Tahapan Pendaftaran</h2>

            <ol className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dubesia-navy-soft font-bold text-dubesia-navy">
                  1
                </span>
                <span>
                  <strong className="text-slate-800">Isi formulir</strong>
                  <br />
                  Lengkapi data diri dan akun.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dubesia-navy-soft font-bold text-dubesia-navy">
                  2
                </span>
                <span>
                  <strong className="text-slate-800">
                    Kirim bukti pembayaran
                  </strong>
                  <br />
                  Unggah file sesuai format.
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dubesia-navy-soft font-bold text-dubesia-navy">
                  3
                </span>
                <span>
                  <strong className="text-slate-800">
                    Tunggu verifikasi admin
                  </strong>
                  <br />
                  Akun diproses sesuai hasil pemeriksaan.
                </span>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
