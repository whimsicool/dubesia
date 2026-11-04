import { useEffect, useRef, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
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

const DB_NAME = 'dubesia';
const DB_STORE = 'bukti-pembayaran';
const DB_KEY = 'pending';
const META_KEY = 'dubesia:bukti-pembayaran';

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) {
        request.result.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const savePendingFile = async (file, owner) => {
  const database = await openDatabase();

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(DB_STORE, 'readwrite');
    transaction.objectStore(DB_STORE).put(
      { blob: file, name: file.name, type: file.type, owner },
      DB_KEY,
    );
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });

  database.close();

  window.localStorage.setItem(
    META_KEY,
    JSON.stringify({ name: file.name, type: file.type, size: file.size, owner }),
  );
};

const loadPendingFile = async (owner) => {
  try {
    const meta = JSON.parse(window.localStorage.getItem(META_KEY) ?? 'null');
    if (!meta || meta.owner !== owner) return null;

    const database = await openDatabase();
    const record = await new Promise((resolve, reject) => {
      const transaction = database.transaction(DB_STORE, 'readonly');
      const request = transaction.objectStore(DB_STORE).get(DB_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
    database.close();

    if (!record || record.owner !== owner) return null;

    return new File([record.blob], record.name, { type: record.type });
  } catch {
    return null;
  }
};

const clearPendingFile = async () => {
  window.localStorage.removeItem(META_KEY);

  try {
    const database = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(DB_STORE, 'readwrite');
      transaction.objectStore(DB_STORE).delete(DB_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  } catch {
    // Berkas tetap bisa dihapus dari state halaman.
  }
};

export default function Pembayaran({ pendaftaran, rekening = [], flash }) {
  const { data, setData, post, processing, errors, reset } = useForm({ bukti_pembayaran: null });
  const [copied, setCopied] = useState('');
  const [fileError, setFileError] = useState('');
  const [localFile, setLocalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confirmHapusLokal, setConfirmHapusLokal] = useState(false);
  const [confirmHapusServer, setConfirmHapusServer] = useState(false);
  const fileInputRef = useRef(null);

  const sudahKirimBukti = pendaftaran.status === 'menunggu_verifikasi';

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (pendaftaran.has_bukti) {
        await clearPendingFile();
        return;
      }

      const file = await loadPendingFile(pendaftaran.email);

      if (!cancelled && file) {
        setLocalFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setData('bukti_pembayaran', file);
      }
    };

    restore();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const copyAccount = async (number) => {
    try {
      await navigator.clipboard.writeText(String(number).replace(/\D/g, ''));
      setCopied(number);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setFileError('Nomor rekening tidak dapat disalin otomatis. Silakan salin secara manual.');
    }
  };

  const chooseFile = async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      setFileError('Format file harus JPG, PNG, atau PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file maksimal 5 MB.');
      return;
    }

    setFileError('');
    setLocalFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setData('bukti_pembayaran', file);

    try {
      await savePendingFile(file, pendaftaran.email);
    } catch {
      setFileError('Berkas tersimpan untuk sesi ini, tetapi gagal disimpan di browser. Pilih ulang jika halaman ditutup.');
    }
  };

  const removeLocalFile = async () => {
    await clearPendingFile();

    setLocalFile(null);
    setConfirmHapusLokal(false);
    setFileError('');
    setData('bukti_pembayaran', null);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = (event) => {
    event.preventDefault();

    if (!localFile) {
      setFileError('Pilih berkas bukti pembayaran terlebih dahulu.');
      return;
    }

    post(route('pembayaran.store'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: async () => {
        await clearPendingFile();
        reset();
      },
    });
  };

  return (
    <AdmisiShell title="Pembayaran Pendaftaran" showLogout>
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-dubesia-red via-dubesia-red to-dubesia-navy px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
          {sudahKirimBukti ? 'Menunggu Verifikasi Admin' : 'Satu Langkah Lagi'}
        </p>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {sudahKirimBukti ? 'Bukti pembayaran sudah kami terima' : 'Selesaikan Pembayaran Pendaftaran'}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          {sudahKirimBukti
            ? 'Admin sedang memeriksa pembayaran Anda. Hapus bukti lama jika ingin mengganti berkas.'
            : 'Transfer biaya kursus ke rekening resmi, lalu unggah bukti pembayaran. Data Anda sudah tersimpan dan dapat dilanjutkan kapan saja.'}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLE[pendaftaran.status] ?? 'bg-white/15 text-white'}`}>
            {pendaftaran.status_label}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{pendaftaran.program}</span>
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
                      className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
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
            <h2 className="text-base font-bold text-slate-900">Bukti Pembayaran</h2>
            <p className="mt-1 text-sm text-slate-500">Format JPG, PNG, atau PDF. Ukuran maksimal 5 MB.</p>

            {pendaftaran.has_bukti ? (
              <>
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-semibold">Bukti pembayaran tersimpan</p>
                  <a
                    href={pendaftaran.bukti_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-bold text-blue-800 underline"
                  >
                    Preview berkas{pendaftaran.bukti_is_pdf ? ' (PDF)' : ''}
                  </a>
                  <p className="mt-2 text-xs leading-5 text-blue-700">
                    Hapus bukti ini dulu jika ingin mengganti berkas.
                  </p>
                </div>

                <div className="mt-4">
                  {confirmHapusServer ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-sm font-semibold text-rose-800">Anda yakin menghapus berkas ini?</p>
                      <button
                        type="button"
                        onClick={() => router.delete(route('pembayaran.bukti.destroy'), { preserveScroll: true })}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmHapusServer(false)}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmHapusServer(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-lg font-bold text-rose-700 transition hover:bg-rose-50"
                      aria-label="Hapus bukti pembayaran"
                    >
                      ×
                    </button>
                  )}
                </div>
              </>
            ) : localFile ? (
              <>
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="break-all font-semibold">{localFile.name}</p>
                  <p className="mt-1 text-xs text-blue-700">
                    {Math.max(1, Math.round(localFile.size / 1024))} KB · tersimpan sementara di browser ini
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.open(previewUrl, '_blank', 'noopener')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Preview
                  </button>

                  {confirmHapusLokal ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2">
                      <p className="px-1 text-sm font-semibold text-rose-800">Anda yakin menghapus berkas ini?</p>
                      <button
                        type="button"
                        onClick={removeLocalFile}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-rose-700"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmHapusLokal(false)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmHapusLokal(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-white text-lg font-bold text-rose-700 transition hover:bg-rose-50"
                      aria-label="Hapus berkas yang dipilih"
                    >
                      ×
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  id="bukti_pembayaran"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="sr-only"
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />

                <label
                  htmlFor="bukti_pembayaran"
                  className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-300"
                >
                  <span className="text-sm font-semibold text-blue-700">+ Tambah File</span>
                </label>
              </>
            )}

            {(fileError || errors.bukti_pembayaran) && (
              <p className="mt-3 text-xs font-semibold text-rose-600" role="alert">
                {fileError || errors.bukti_pembayaran}
              </p>
            )}

            {!pendaftaran.has_bukti && (
              <button
                type="button"
                onClick={submit}
                disabled={processing || !localFile}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
              </button>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="bg-blue-50 px-5 py-4 sm:px-6">
              <h2 className="text-base font-extrabold text-blue-900">Program {pendaftaran.program}</h2>
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

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
            <h2 className="font-bold text-blue-900">Data Anda Aman</h2>
            <p className="mt-2 text-sm leading-6 text-blue-800">
              Anda boleh meninggalkan halaman ini. Berkas yang dipilih tersimpan sementara di browser ini.
            </p>
            <p className="mt-2 text-xs leading-5 text-blue-700">{pendaftaran.email}</p>
          </section>
        </aside>
      </div>
    </AdmisiShell>
  );
}
