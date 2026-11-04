import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdmisiShell from '@/Components/Registrasi/AdmisiShell';

const rupiah = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const BENEFITS = [
  {
    title: 'Pengajar berpengalaman',
    body: 'Kelas dibimbing tutor bahasa Inggris yang terbiasa menangani kebutuhan akademik dan profesional.',
  },
  {
    title: 'Jadwal fleksibel',
    body: 'Pilih program reguler, private, atau employee sesuai ritme belajar dan pekerjaan Anda.',
  },
  {
    title: 'Pembayaran tanpa tenggat',
    body: 'Data pendaftaran tersimpan. Lanjutkan pembayaran kapan pun memakai akun yang sama.',
  },
];

const STATUS_STYLE = {
  menunggu_pembayaran: 'bg-amber-100 text-amber-800',
  menunggu_verifikasi: 'bg-sky-100 text-sky-800',
};

export default function Pembayaran({ pendaftaran, rekening = [], flash }) {
  const { data, setData, post, processing, errors, reset } = useForm({ bukti_pembayaran: null });
  const [copied, setCopied] = useState('');
  const [fileError, setFileError] = useState('');

  const sudahKirimBukti = pendaftaran.status === 'menunggu_verifikasi';

  const copyAccount = async (number) => {
    try {
      await navigator.clipboard.writeText(String(number).replace(/\D/g, ''));
      setCopied(number);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setFileError('Nomor rekening tidak dapat disalin otomatis. Silakan salin secara manual.');
    }
  };

  const chooseFile = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setFileError('Format file harus JPG, PNG, atau PDF.');
      setData('bukti_pembayaran', null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 5 MB.');
      setData('bukti_pembayaran', null);
      return;
    }

    setFileError('');
    setData('bukti_pembayaran', file);
  };

  const submit = (event) => {
    event.preventDefault();

    if (!data.bukti_pembayaran) {
      setFileError('Pilih berkas bukti pembayaran terlebih dahulu.');
      return;
    }

    post(route('pembayaran.store'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <AdmisiShell title="Pembayaran Pendaftaran" showLogout>
      <Head title="Pembayaran Pendaftaran" />

      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-dubesia-navy via-dubesia-navy to-dubesia-red px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
          {sudahKirimBukti ? 'Menunggu Verifikasi Admin' : 'Satu Langkah Lagi'}
        </p>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {sudahKirimBukti ? 'Bukti pembayaran sudah kami terima' : 'Selesaikan Pembayaran Pendaftaran'}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          {sudahKirimBukti
            ? 'Admin sedang memeriksa pembayaran Anda. Anda tetap dapat mengganti berkas bukti bila diperlukan.'
            : 'Transfer biaya kursus ke rekening resmi, lalu unggah bukti pembayaran. Data Anda sudah tersimpan dan dapat dilanjutkan kapan saja.'}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[pendaftaran.status] ?? 'bg-white/15 text-white'}`}>
            {pendaftaran.status_label}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {pendaftaran.program}
          </span>
          <span className="text-2xl font-extrabold">{rupiah(pendaftaran.biaya)}</span>
        </div>
      </section>

      {flash?.sukses && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {flash.sukses}
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-base font-bold text-slate-900">Rekening Tujuan Transfer</h2>
            <p className="mt-1 text-sm text-slate-500">Transfer tepat sebesar {rupiah(pendaftaran.biaya)}.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {rekening.map((account) => (
                <div key={`${account.bank}-${account.nomor}`} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{account.bank}</p>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="break-all text-lg font-extrabold text-slate-900">{account.nomor}</p>

                    <button
                      type="button"
                      onClick={() => copyAccount(account.nomor)}
                      className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-dubesia-red hover:bg-dubesia-red-soft"
                    >
                      {copied === account.nomor ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">a.n. {account.atas_nama}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-base font-bold text-slate-900">
              {sudahKirimBukti ? 'Ganti Bukti Pembayaran' : 'Unggah Bukti Pembayaran'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Format JPG, PNG, atau PDF. Ukuran maksimal 5 MB.</p>

            {pendaftaran.has_bukti && (
              <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                <p className="font-semibold">Bukti pembayaran tersimpan</p>
                <a
                  href={pendaftaran.bukti_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs font-bold text-sky-800 underline"
                >
                  Lihat berkas{pendaftaran.bukti_is_pdf ? ' (PDF)' : ''}
                </a>
              </div>
            )}

            <form onSubmit={submit} className="mt-4 space-y-4">
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-dubesia-red/50">
                <input
                  id="bukti_pembayaran"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="sr-only"
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />

                <div className="text-3xl text-dubesia-red">↑</div>

                {data.bukti_pembayaran ? (
                  <p className="mt-2 break-all text-sm font-semibold text-slate-800">{data.bukti_pembayaran.name}</p>
                ) : (
                  <p className="mt-2 text-sm font-semibold text-slate-800">Pilih berkas bukti pembayaran</p>
                )}

                <label
                  htmlFor="bukti_pembayaran"
                  className="mt-4 inline-flex cursor-pointer rounded-lg bg-dubesia-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-dubesia-navy"
                >
                  Pilih File
                </label>
              </div>

              {(fileError || errors.bukti_pembayaran) && (
                <p className="text-xs font-semibold text-rose-600" role="alert">
                  {fileError || errors.bukti_pembayaran}
                </p>
              )}

              <button
                type="submit"
                disabled={processing}
                className="flex w-full items-center justify-center rounded-lg bg-dubesia-red px-5 py-3.5 text-sm font-bold text-white transition hover:bg-dubesia-navy disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? 'Mengunggah...' : sudahKirimBukti ? 'Kirim Bukti Baru' : 'Kirim Bukti Pembayaran'}
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="bg-dubesia-red-soft px-5 py-4 sm:px-6">
              <h2 className="text-base font-extrabold text-dubesia-navy">
                Program {pendaftaran.program}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{pendaftaran.program_deskripsi}</p>
            </div>

            <ul className="divide-y divide-slate-100">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="px-5 py-4 sm:px-6">
                  <p className="text-sm font-bold text-slate-900">{benefit.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{benefit.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6">
            <h2 className="font-bold text-emerald-900">Data Anda Aman</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Anda boleh meninggalkan halaman ini. Masuk kembali dengan email dan kata sandi Anda untuk melanjutkan pembayaran.
            </p>
            <p className="mt-2 text-xs leading-5 text-emerald-700">{pendaftaran.email}</p>
          </section>
        </aside>
      </div>
    </AdmisiShell>
  );
}
