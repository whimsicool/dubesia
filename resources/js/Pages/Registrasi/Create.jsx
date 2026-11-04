import { useEffect, useRef, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdmisiShell from '@/Components/Registrasi/AdmisiShell';

const rupiah = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const inputClass =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-dubesia-red focus:ring-2 focus:ring-dubesia-red/15';

const FIELD_LABELS = {
  nama_lengkap: 'Nama lengkap',
  tanggal_lahir: 'Tanggal lahir',
  email: 'Email',
  no_whatsapp: 'Nomor WhatsApp',
  asal_institusi: 'Asal institusi',
  pendidikan_terakhir: 'Pendidikan terakhir',
  alamat: 'Alamat',
  program: 'Program kursus',
  password: 'Kata sandi',
  password_confirmation: 'Konfirmasi kata sandi',
  bukti_pembayaran: 'Bukti pembayaran',
  setuju: 'Persetujuan',
};

function Field({ label, required = false, hint, error, children, id }) {
  return (
    <div id={id} className="min-w-0 space-y-1.5">
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

      {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
    </div>
  );
}

export default function Create({
  programs = [],
  pendidikanOptions = [],
  editMode = false,
  pendaftaran = null,
}) {
  const { data, setData, post, put, processing, errors, clearErrors } = useForm({
    nama_lengkap: pendaftaran?.nama_lengkap ?? '',
    tanggal_lahir: pendaftaran?.tanggal_lahir ?? '',
    email: pendaftaran?.email ?? '',
    no_whatsapp: pendaftaran?.no_whatsapp ?? '',
    asal_institusi: pendaftaran?.asal_institusi ?? '',
    pendidikan_terakhir: pendaftaran?.pendidikan_terakhir ?? '',
    alamat: pendaftaran?.alamat ?? '',
    pesan_motivasi: pendaftaran?.pesan_motivasi ?? '',
    program: programs.some((item) => item.value === pendaftaran?.program)
      ? pendaftaran.program
      : programs[0]?.value ?? '',
    password: '',
    password_confirmation: '',
    bukti_pembayaran: null,
    setuju: editMode,
  });

  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [clientErrors, setClientErrors] = useState({});

  const fileInput = useRef(null);
  const selectedProgram = programs.find((program) => program.value === data.program);
  const selectedBiaya = selectedProgram?.biaya ?? 0;
  const invalidFields = Object.keys(FIELD_LABELS).filter(
    (field) => clientErrors[field] || errors[field],
  );

  useEffect(() => {
    const firstInvalidField = Object.keys(errors).find((field) => field !== 'umum');
    if (firstInvalidField) {
      window.setTimeout(
        () => document.getElementById(`field-${firstInvalidField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        0,
      );
    }
  }, [errors]);

  const chooseFile = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

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

  const fieldError = (name) => clientErrors[name] || errors[name];
  const updateField = (name, value) => {
    setData(name, value);
    clearErrors(name);
    setClientErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!data.nama_lengkap.trim()) nextErrors.nama_lengkap = 'Masukkan nama lengkap sesuai identitas.';
    if (!data.tanggal_lahir) nextErrors.tanggal_lahir = 'Pilih tanggal lahir Anda.';
    else if (data.tanggal_lahir > '2020-12-31')
      nextErrors.tanggal_lahir = 'Tanggal lahir maksimal 31 Desember 2020.';
    if (!data.email.trim()) nextErrors.email = 'Masukkan alamat email yang aktif.';
    else if (!/^[^\s@]+@gmail\.com$/i.test(data.email.trim()))
      nextErrors.email = 'Gunakan alamat email Gmail yang berakhiran @gmail.com.';
    const phoneDigits = String(data.no_whatsapp).trim();
    if (!phoneDigits) nextErrors.no_whatsapp = 'Masukkan nomor WhatsApp yang aktif tanpa kode negara.';
    else if (!/^[0-9]+$/.test(phoneDigits))
      nextErrors.no_whatsapp = 'Nomor WhatsApp hanya boleh berisi angka. Hapus huruf atau simbol.';
    if (!data.asal_institusi.trim())
      nextErrors.asal_institusi = 'Masukkan nama sekolah, universitas, perusahaan, atau institusi asal.';
    if (!data.pendidikan_terakhir) nextErrors.pendidikan_terakhir = 'Pilih jenjang pendidikan terakhir Anda.';
    if (!data.alamat.trim()) nextErrors.alamat = 'Masukkan alamat lengkap, termasuk kota/kabupaten.';
    if (!data.program) nextErrors.program = 'Pilih salah satu program kursus.';
    if (!editMode) {
      if (!data.password) nextErrors.password = 'Buat kata sandi untuk akun Anda.';
      else if (data.password.length < 8) nextErrors.password = 'Kata sandi minimal 8 karakter.';
      if (data.password !== data.password_confirmation)
        nextErrors.password_confirmation = 'Ulangi kata sandi dengan nilai yang sama.';
    }
    if (!data.setuju) nextErrors.setuju = 'Centang persetujuan setelah memastikan data yang diisi sudah benar.';
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstInvalidField = Object.keys(nextErrors)[0];
      window.setTimeout(
        () => document.getElementById(`field-${firstInvalidField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        0,
      );
      return;
    }

    if (editMode) {
      put(route('registrasi.update'), { forceFormData: true });
      return;
    }

    post('/registrasi');
  };

  return (
    <AdmisiShell title={editMode ? 'Perbaikan Pendaftaran' : 'Registrasi Calon Murid'} showLogout={editMode}>
      <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-dubesia-red via-dubesia-red to-dubesia-navy px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
          {editMode ? 'Perbaikan Pendaftaran' : 'Pendaftaran Calon Murid'}
        </p>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {editMode ? 'Perbaiki Data Pendaftaran' : 'Formulir Registrasi Calon Murid'}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          {editMode
            ? 'Periksa catatan admin, perbaiki bagian yang diperlukan, lalu kirim kembali untuk diverifikasi.'
            : 'Lengkapi data diri Anda. Setelah formulir dikirim, Anda langsung masuk ke halaman pembayaran.'}
        </p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.95fr)]">
        <form
          id="form-registrasi"
          onSubmit={submit}
          noValidate
          className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7"
        >
          {editMode && pendaftaran?.catatan_verifikasi && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:p-5">
              <h2 className="font-bold">Catatan perbaikan dari admin</h2>
              <p className="mt-2 whitespace-pre-wrap leading-6">{pendaftaran.catatan_verifikasi}</p>
            </div>
          )}

          {invalidFields.length > 0 && (
            <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-bold">{invalidFields.length} bagian belum benar</p>

              <ul className="mt-2 space-y-1">
                {invalidFields.map((field) => (
                  <li key={field}>
                    <button
                      type="button"
                      onClick={() => document.getElementById(`field-${field}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className="font-semibold underline decoration-rose-300 underline-offset-2 hover:text-rose-950"
                    >
                      {FIELD_LABELS[field]}
                    </button>
                    <span className="text-rose-700"> — {fieldError(field)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {errors.umum && (
            <div role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {errors.umum}
            </div>
          )}

          <section>
            <SectionTitle title="Data Diri" description="Masukkan informasi pribadi yang benar dan masih aktif." />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="field-nama_lengkap" label="Nama Lengkap" required error={fieldError('nama_lengkap')}>
                <input
                  required
                  autoComplete="name"
                  className={`${inputClass} ${fieldError('nama_lengkap') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                  value={data.nama_lengkap}
                  onChange={(e) => updateField('nama_lengkap', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </Field>

              <Field id="field-tanggal_lahir" label="Tanggal Lahir" required error={fieldError('tanggal_lahir')}>
                <input
                  required
                  type="date"
                  max="2020-12-31"
                  className={`${inputClass} ${fieldError('tanggal_lahir') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                  value={data.tanggal_lahir}
                  onChange={(e) => updateField('tanggal_lahir', e.target.value)}
                />
              </Field>

              <Field id="field-email" label="Email" required error={fieldError('email')}>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className={`${inputClass} ${fieldError('email') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                  value={data.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="nama@gmail.com"
                />
              </Field>

              <Field id="field-no_whatsapp" label="Nomor WhatsApp" required error={fieldError('no_whatsapp')}>
                <div className="flex min-w-0 rounded-lg border border-slate-200 focus-within:border-dubesia-red focus-within:ring-2 focus-within:ring-dubesia-red/15">
                  <span className="flex items-center rounded-l-lg bg-slate-100 px-3 text-sm font-semibold text-slate-600">
                    +62
                  </span>

                  <input
                    required
                    inputMode="tel"
                    autoComplete="tel-national"
                    className={`min-w-0 flex-1 rounded-r-lg px-3 py-3 text-sm outline-none ${fieldError('no_whatsapp') ? 'bg-rose-50/40' : ''}`}
                    value={data.no_whatsapp}
                    onChange={(e) => updateField('no_whatsapp', e.target.value.replace(/\D/g, ''))}
                    placeholder="81234567890"
                  />
                </div>
              </Field>

              <Field id="field-asal_institusi" label="Asal Institusi" required error={fieldError('asal_institusi')}>
                <input
                  required
                  autoComplete="organization"
                  className={`${inputClass} ${fieldError('asal_institusi') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                  value={data.asal_institusi}
                  onChange={(e) => updateField('asal_institusi', e.target.value)}
                  placeholder="Nama sekolah, universitas, atau perusahaan"
                />
              </Field>

              <Field id="field-pendidikan_terakhir" label="Pendidikan Terakhir" required error={fieldError('pendidikan_terakhir')}>
                <select
                  required
                  className={`${inputClass} ${fieldError('pendidikan_terakhir') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                  value={data.pendidikan_terakhir}
                  onChange={(e) => updateField('pendidikan_terakhir', e.target.value)}
                >
                  <option value="">Pilih pendidikan terakhir</option>
                  {pendidikanOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field id="field-alamat" label="Alamat Lengkap" required error={fieldError('alamat')}>
                  <textarea
                    required
                    rows={3}
                    className={`${inputClass} resize-y ${fieldError('alamat') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                    value={data.alamat}
                    onChange={(e) => updateField('alamat', e.target.value)}
                    placeholder="Jalan, nomor rumah, RT/RW, kecamatan, kota/kabupaten, kode pos..."
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="mt-8 border-t border-slate-100 pt-6">
            <SectionTitle title="Program Kursus" description="Pilih program yang ingin Anda ikuti." />

            <Field id="field-program" label="Pilihan Program" required error={fieldError('program')}>
              <div className="grid gap-3 sm:grid-cols-2">
                {programs.map((program) => (
                  <label
                    key={program.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      data.program === program.value
                        ? 'border-dubesia-red bg-dubesia-red-soft ring-1 ring-dubesia-red/20'
                        : 'border-slate-200 hover:border-dubesia-red/40'
                    }`}
                  >
                    <input
                      required
                      type="radio"
                      name="program"
                      value={program.value}
                      checked={data.program === program.value}
                      onChange={() => updateField('program', program.value)}
                      className="mt-1 accent-dubesia-red"
                    />

                    <span className="flex-1">
                      <span className="block text-sm font-bold text-slate-900">{program.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{program.deskripsi}</span>
                      <span className="mt-2 block text-sm font-bold text-dubesia-red">{rupiah(program.biaya)}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="mt-4 rounded-xl bg-dubesia-red-soft p-4 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-700">Biaya Kursus</p>

              <p className="mt-2 text-2xl font-extrabold text-dubesia-red sm:mt-0">{rupiah(selectedBiaya)}</p>
            </div>
          </section>

          {!editMode && (
            <section className="mt-8 border-t border-slate-100 pt-6">
              <SectionTitle
                title="Akun Anda"
                description="Kata sandi ini dipakai untuk masuk dan melanjutkan pembayaran kapan saja."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="field-password" label="Kata Sandi" required error={fieldError('password')}>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    className={`${inputClass} ${fieldError('password') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                    value={data.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Minimal 8 karakter"
                  />
                </Field>

                <Field
                  id="field-password_confirmation"
                  label="Konfirmasi Kata Sandi"
                  required
                  error={fieldError('password_confirmation')}
                >
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    className={`${inputClass} ${fieldError('password_confirmation') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                    value={data.password_confirmation}
                    onChange={(e) => updateField('password_confirmation', e.target.value)}
                    placeholder="Ulangi kata sandi"
                  />
                </Field>
              </div>
            </section>
          )}

          {editMode && (
            <section className="mt-8 border-t border-slate-100 pt-6">
              <SectionTitle
                title="Bukti Pembayaran"
                description="Ganti berkas hanya jika admin meminta perbaikan bukti pembayaran."
              />

              <Field
                id="field-bukti_pembayaran"
                label="Bukti Pembayaran"
                hint="Opsional"
                error={fileError || fieldError('bukti_pembayaran')}
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
                    dragging ? 'border-dubesia-red bg-dubesia-red-soft' : 'border-slate-200 bg-slate-50 hover:border-dubesia-red/50'
                  }`}
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    className="sr-only"
                    onChange={(event) => chooseFile(event.target.files?.[0])}
                  />

                  <div className="text-3xl text-dubesia-red">↑</div>

                  {data.bukti_pembayaran ? (
                    <p className="mt-2 break-all text-sm font-semibold text-slate-800">{data.bukti_pembayaran.name}</p>
                  ) : pendaftaran?.bukti_url ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-semibold text-slate-800">Bukti pembayaran saat ini tetap digunakan</p>
                      <a
                        href={pendaftaran.bukti_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-dubesia-red underline"
                      >
                        Lihat bukti yang tersimpan{pendaftaran.bukti_is_pdf ? ' (PDF)' : ''}
                      </a>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-slate-800">Belum ada bukti pembayaran tersimpan</p>
                  )}

                  <p className="mt-1 text-xs text-slate-500">JPG, PNG, atau PDF · Maksimal 5 MB</p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="rounded-lg bg-dubesia-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-dubesia-navy"
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
          )}

          <section className="mt-8 border-t border-slate-100 pt-6">
            <Field label="Pesan / Motivasi Belajar" hint="Opsional" error={fieldError('pesan_motivasi')}>
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
                  onChange={(e) => updateField('setuju', e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-dubesia-red"
                />

                <span>Saya menyatakan bahwa data yang diberikan benar dan menyetujui ketentuan serta kebijakan privasi DUBESIA.</span>
              </label>

              {fieldError('setuju') && (
                <p id="field-setuju" className="mt-1.5 text-xs text-rose-600">
                  {fieldError('setuju')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-dubesia-red px-5 py-3.5 text-sm font-bold text-white transition hover:bg-dubesia-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing
                ? editMode
                  ? 'Mengirim perbaikan...'
                  : 'Mendaftarkan akun...'
                : editMode
                  ? 'Kirim Ulang untuk Verifikasi'
                  : 'Daftar dan Lanjut ke Pembayaran'}
            </button>

            {!editMode && (
              <p className="mt-4 text-center text-sm text-slate-500">
                Sudah memiliki akun?{' '}
                <Link href="/login" className="font-semibold text-dubesia-red hover:underline">
                  Masuk di sini
                </Link>
              </p>
            )}
          </section>
        </form>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Ringkasan Pendaftaran</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">Program</dt>
                <dd className="text-right font-semibold text-slate-900">{selectedProgram?.label ?? '-'}</dd>
              </div>

              <div className="flex items-start justify-between gap-3">
                <dt className="text-slate-500">Biaya kursus</dt>
                <dd className="text-right font-semibold text-dubesia-red">{rupiah(selectedBiaya)}</dd>
              </div>

              {editMode && (
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="text-right font-semibold text-slate-900">{pendaftaran?.status ?? '-'}</dd>
                </div>
              )}
            </dl>

            {!editMode && (
              <p className="mt-4 rounded-lg bg-dubesia-red-soft p-3 text-xs leading-5 text-slate-700">
                Rekening tujuan transfer dan unggah bukti pembayaran tersedia di halaman berikutnya.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
            <h2 className="font-bold text-emerald-900">Data Anda Aman</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Data pendaftaran digunakan untuk proses administrasi dan verifikasi oleh DUBESIA.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">{editMode ? 'Tahapan Perbaikan' : 'Tahapan Pendaftaran'}</h2>

            <ol className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dubesia-red-soft font-bold text-dubesia-red">
                  1
                </span>
                <span>
                  <strong className="text-slate-800">{editMode ? 'Perbaiki data' : 'Isi formulir'}</strong>
                  <br />
                  {editMode ? 'Perbarui bagian yang dijelaskan admin.' : 'Lengkapi data diri dan buat kata sandi.'}
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dubesia-red-soft font-bold text-dubesia-red">
                  2
                </span>
                <span>
                  <strong className="text-slate-800">{editMode ? 'Kirim ulang formulir' : 'Selesaikan pembayaran'}</strong>
                  <br />
                  {editMode ? 'Data Anda dikirim kembali untuk diperiksa.' : 'Transfer sesuai biaya program, lalu unggah bukti.'}
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dubesia-red-soft font-bold text-dubesia-red">
                  3
                </span>
                <span>
                  <strong className="text-slate-800">Tunggu verifikasi admin</strong>
                  <br />
                  Akun aktif setelah pembayaran diverifikasi.
                </span>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </AdmisiShell>
  );
}
