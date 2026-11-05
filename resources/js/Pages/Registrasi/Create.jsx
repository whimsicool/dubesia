import GmailInput from '@/Components/GmailInput';

import { useEffect, useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, FileUp } from 'lucide-react';
import AdmisiShell from '@/Components/Registrasi/AdmisiShell';
import useEmailAvailability from '@/Hooks/useEmailAvailability';

const rupiah = (value) =>
  `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const inputClass =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-dubesia-red focus:ring-2 focus:ring-rose-100';

const DRAFT_KEY = 'dubesia:registrasi-draft';

const DRAFT_FIELDS = [
  'nama_lengkap',
  'tanggal_lahir',
  'email',
  'no_whatsapp',
  'asal_institusi',
  'alamat',
  'pesan_motivasi',
  'program',
  'setuju',
];

const readDraft = () => {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return null;

    return Object.fromEntries(
      Object.entries(parsed).filter(([key]) => DRAFT_FIELDS.includes(key)),
    );
  } catch {
    return null;
  }
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

      {description && (
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function Create({
  programs = [],
  biaya = 250000,
  editMode = false,
  pendaftaran = null,
}) {
  const draft = !editMode && typeof window !== 'undefined' ? readDraft() : null;
  const restoredDraft = draft
    ? {
        ...draft,
        program: programs.some((item) => item.value === draft.program)
          ? draft.program
          : programs[0]?.value ?? '',
      }
    : {};

  const { data, setData, post, put, processing, errors, clearErrors } = useForm({
    nama_lengkap: pendaftaran?.nama_lengkap ?? '',
    tanggal_lahir: pendaftaran?.tanggal_lahir ?? '',
    email: pendaftaran?.email ?? '',
    no_whatsapp: pendaftaran?.no_whatsapp ?? '',
    asal_institusi: pendaftaran?.asal_institusi ?? '',
    alamat: pendaftaran?.alamat ?? '',
    pesan_motivasi: pendaftaran?.pesan_motivasi ?? '',
    program: programs.some((item) => item.value === pendaftaran?.program)
      ? pendaftaran.program
      : programs[0]?.value ?? '',
    setuju: editMode,
    ...restoredDraft,
  });

  const [clientErrors, setClientErrors] = useState({});
  const [emailDikonfirmasi, setEmailDikonfirmasi] = useState(false);
  const authUser = usePage().props.auth?.user ?? null;
  const emailCheck = useEmailAvailability(
    data.email,
    editMode ? authUser?.id : null,
  );

  const selectedProgram = programs.find((program) => program.value === data.program);
  const selectedBiaya = selectedProgram?.biaya ?? biaya;

  useEffect(() => {
    const firstInvalidField = Object.keys(errors).find((field) => field !== 'umum');
    if (firstInvalidField) {
      window.setTimeout(() => document.getElementById(`field-${firstInvalidField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }, [errors]);

  useEffect(() => {
    if (editMode) return;

    const snapshot = {};
    DRAFT_FIELDS.forEach((field) => {
      snapshot[field] = data[field];
    });

    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot));
    } catch {
      // localStorage penuh atau diblokir; isian tetap bisa dikirim.
    }
  }, [data, editMode]);

  const fieldError = (name) => clientErrors[name] || errors[name];
  const updateField = (name, value) => {
    setData(name, value);
    clearErrors(name);

    // Email yang berubah harus dikonfirmasi ulang sebelum formulir dikirim.
    if (name === 'email') {
      setEmailDikonfirmasi(false);
      setData('setuju', false);
    }

    setClientErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const updateEmailConfirmation = (checked) => {
    setEmailDikonfirmasi(checked);
    setClientErrors((current) => {
      if (!current.konfirmasi) return current;
      const next = { ...current };
      delete next.konfirmasi;
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!data.nama_lengkap.trim()) nextErrors.nama_lengkap = 'Masukkan nama lengkap sesuai identitas.';
    if (!data.tanggal_lahir) nextErrors.tanggal_lahir = 'Pilih tanggal lahir Anda.';
    else if (data.tanggal_lahir > '2020-12-31') nextErrors.tanggal_lahir = 'Tanggal lahir maksimal 31 Desember 2020.';
    if (!data.email.trim()) nextErrors.email = 'Masukkan alamat email yang aktif.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) nextErrors.email = 'Format email tidak valid.';
    else if (emailCheck.status === 'taken') nextErrors.email = emailCheck.message;
    const phoneDigits = String(data.no_whatsapp).trim();
    if (!phoneDigits) nextErrors.no_whatsapp = 'Masukkan nomor WhatsApp yang aktif tanpa kode negara.';
    else if (!/^[0-9]+$/.test(phoneDigits)) nextErrors.no_whatsapp = 'Nomor WhatsApp hanya boleh berisi angka. Hapus huruf atau simbol.';
    if (!data.asal_institusi.trim()) nextErrors.asal_institusi = 'Masukkan nama sekolah, universitas, perusahaan, atau institusi asal.';
    if (!data.alamat.trim()) nextErrors.alamat = 'Masukkan alamat lengkap, termasuk kota/kabupaten.';
    if (!data.program) nextErrors.program = 'Pilih salah satu program kursus.';
    if (!emailDikonfirmasi) nextErrors.konfirmasi = 'Centang pernyataan setelah memastikan data diri dan email sudah benar.';
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstInvalidField = Object.keys(nextErrors)[0];
      window.setTimeout(() => document.getElementById(`field-${firstInvalidField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return;
    }

    if (editMode) {
      put(route('registrasi.update'), { forceFormData: true });
      return;
    }

    post('/registrasi', {
      onSuccess: () => {
        window.localStorage.removeItem(DRAFT_KEY);
      },
    });
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
            : 'Lengkapi data diri Anda untuk menjadi bagian dari DUBESIA. Bersama kami, wujudkan masa depan global Anda.'}
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

              <Field
                id="field-tanggal_lahir"
                label="Tanggal Lahir"
                required
                error={fieldError('tanggal_lahir')}
              >
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
                <GmailInput
                  required
                  
                  autoComplete="email"
                  className={`${inputClass} ${fieldError('email') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                  value={data.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="nama@email.com"
                />
                {!fieldError('email') && emailCheck.status === 'checking' && (
                  <p className="text-xs text-slate-500">Memeriksa email...</p>
                )}
                {!fieldError('email') && emailCheck.status === 'available' && (
                  <p className="text-xs text-emerald-600">Email tersedia.</p>
                )}
                {!fieldError('email') && emailCheck.status === 'taken' && (
                  <p className="text-xs text-rose-600" role="alert">
                    {emailCheck.message}
                  </p>
                )}
              </Field>

              <Field
                id="field-no_whatsapp"
                label="Nomor WhatsApp"
                required
                error={fieldError('no_whatsapp')}
              >
                <div className="flex min-w-0 rounded-lg border border-slate-200 focus-within:border-dubesia-red focus-within:ring-2 focus-within:ring-rose-100">
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

              <div className="sm:col-span-2">
                <Field id="field-asal_institusi" label="Asal Institusi" required error={fieldError('asal_institusi')}>
                  <input
                    required
                    autoComplete="organization"
                    className={`${inputClass} ${fieldError('asal_institusi') ? 'border-rose-400 bg-rose-50/40' : ''}`}
                    value={data.asal_institusi}
                    onChange={(e) => updateField('asal_institusi', e.target.value)}
                    placeholder="Nama sekolah, universitas, perusahaan, atau institusi"
                  />
                </Field>
              </div>

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
            <SectionTitle
              title="Program Kursus"
              description="Pilih program yang ingin Anda ikuti."
            />

            <Field id="field-program" label="Pilihan Program" required error={fieldError('program')}>
              <div className="grid gap-3 sm:grid-cols-2">
                {programs.map((program) => (
                  <label
                    key={program.value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      data.program === program.value
                        ? 'border-dubesia-red bg-rose-50 ring-1 ring-dubesia-red/20'
                        : 'border-slate-200 hover:border-rose-200'
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
                      <span className="block text-sm font-bold text-slate-900">
                        {program.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {program.deskripsi}
                      </span>
                      <span className="mt-2 block text-sm font-bold text-dubesia-red">
                        {rupiah(program.biaya)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            <div className="mt-4 rounded-xl bg-blue-50 p-4 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Biaya Pendaftaran
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Periksa informasi pembayaran sebelum mengirim formulir.
                </p>
              </div>

              <p className="mt-2 text-2xl font-extrabold text-blue-700 sm:mt-0">
                {rupiah(selectedBiaya)}
              </p>
            </div>
          </section>

          <section className="mt-8 border-t border-slate-100 pt-6">
            <Field
              label="Pesan / Motivasi Belajar"
              hint="Opsional"
              error={fieldError('pesan_motivasi')}
            >
              <textarea
                rows={3}
                className={`${inputClass} resize-y`}
                value={data.pesan_motivasi}
                onChange={(e) => setData('pesan_motivasi', e.target.value)}
                placeholder="Ceritakan alasan atau motivasi Anda mengikuti program ini..."
              />
            </Field>

            <div id="field-konfirmasi" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />

                <div className="min-w-0">
                  <p className="text-sm font-bold text-amber-900">
                    Periksa data diri sebelum mendaftar
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-900">
                    Pastikan email Anda di bawah ini sudah benar. Kuitansi
                    pembayaran, status verifikasi dari admin, dan kata sandi
                    sementara akun Anda akan dikirim ke email tersebut. Pastikan
                    email aktif dan memiliki ruang penyimpanan yang cukup untuk menerima pesan.
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-amber-950">
                    {data.email || 'Email belum diisi'}
                  </p>

                  <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm font-semibold leading-6 text-amber-950">
                    <input
                      type="checkbox"
                      checked={emailDikonfirmasi}
                      onChange={(e) => {
                        updateField('setuju', e.target.checked);
                        updateEmailConfirmation(e.target.checked);
                      }}
                      className="mt-1 h-4 w-4 shrink-0 accent-amber-700"
                    />

                    <span>
                      Saya sudah memeriksa seluruh data yang diisi dan memastikan
                      semuanya sesuai, benar, serta dapat dipertanggungjawabkan.
                    </span>
                  </label>

                  {(fieldError('setuju') || fieldError('konfirmasi')) && (
                    <p id="field-setuju" className="mt-1.5 text-xs text-rose-600">
                      {fieldError('setuju') || fieldError('konfirmasi')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-dubesia-red px-5 py-3.5 text-sm font-bold text-white transition hover:bg-dubesia-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? <FileUp className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              {processing
                ? (editMode ? 'Mengirim perbaikan...' : 'Mengirim pendaftaran...')
                : (editMode ? 'Kirim Ulang untuk Verifikasi' : 'Daftar dan Lanjut ke Pembayaran')}
            </button>

            {!editMode && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Isian tersimpan otomatis di browser ini.
              </p>
            )}

            {!editMode && <p className="mt-4 text-center text-sm text-slate-500">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-semibold text-dubesia-red hover:underline">
                Masuk di sini
              </Link>
            </p>}
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
            </dl>

            {!editMode && (
              <p className="mt-4 rounded-lg bg-rose-50 p-3 text-xs leading-5 text-slate-700">
                Rekening tujuan transfer dan unggah bukti pembayaran tersedia di halaman berikutnya.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
            <h2 className="font-bold text-emerald-900">Data Anda Aman</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Data pendaftaran digunakan untuk proses administrasi dan
              verifikasi oleh DUBESIA.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-slate-900">{editMode ? 'Tahapan Perbaikan' : 'Tahapan Pendaftaran'}</h2>

            <ol className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 font-bold text-dubesia-red">
                  1
                </span>
                <span>
                  <strong className="text-slate-800">{editMode ? 'Perbaiki data' : 'Isi formulir'}</strong>
                  <br />
                  {editMode ? 'Perbarui bagian yang dijelaskan admin.' : 'Lengkapi data diri dan program.'}
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 font-bold text-dubesia-red">
                  2
                </span>
                <span>
                  <strong className="text-slate-800">{editMode ? 'Kirim ulang formulir' : 'Selesaikan pembayaran'}</strong>
                  <br />
                  {editMode ? 'Data Anda dikirim kembali untuk diperiksa.' : 'Transfer sesuai biaya program di halaman berikutnya.'}
                </span>
              </li>

              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 font-bold text-dubesia-red">
                  3
                </span>
                <span>
                  <strong className="text-slate-800">{editMode ? 'Menunggu verifikasi ulang' : 'Tunggu verifikasi admin'}</strong>
                  <br />
                  Unggah bukti pembayaran, lalu tunggu pemeriksaan admin.
                </span>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </AdmisiShell>
  );
}
