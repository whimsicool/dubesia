import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, ExternalLink, Send, X, XCircle } from '@/Components/Icons';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="col-span-2 break-words font-semibold text-[#0f1b2d]">{children || '-'}</dd>
    </div>
  );
}

export default function Show({ pendaftaran: p, flash }) {
  const [showTolak, setShowTolak] = useState(false);
  const [showVerif, setShowVerif] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ catatan_verifikasi: '' });

  const verifikasi = () => {
    router.post(route('admin.calon-murid.verifikasi', p.id), {}, {
      onStart: () => setBusy(true),
      onFinish: () => { setBusy(false); setShowVerif(false); },
    });
  };

  const tolak = (e) => {
    e.preventDefault();
    post(route('admin.calon-murid.tolak', p.id), {
      onSuccess: () => { reset(); setShowTolak(false); },
    });
  };

  const tutupTolak = () => { setShowTolak(false); reset(); clearErrors(); };

  return (
    <AdminLayout
      title="Detail Pendaftaran"
      breadcrumbs={[
        { label: 'Dashboard Admin', route: 'admin.dashboard' },
        { label: 'Calon Murid', route: 'admin.calon-murid.index' },
        { label: 'Detail Pendaftaran', current: true, route: 'admin.calon-murid.show', params: { pendaftaran: p.id } },
      ]}
    >
      <Head title={`Detail Pendaftaran - ${p.nama_lengkap}`} />
      <div>
        <Link href={route('admin.calon-murid.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#0f1b2d]">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#0f1b2d]">{p.nama_lengkap}</h1>
          <StatusBadge status={p.status} label={p.status_label} />
        </div>

        {flash?.error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{flash.error}</div>}
        {p.perbaikan_baru && <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-800">Perbaikan baru dikirim{p.dikirim_ulang_pada ? ` pada ${p.dikirim_ulang_pada}` : ''}. Pendaftaran ini menunggu verifikasi ulang.</div>}

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {/* data pendaftaran */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#0f1b2d]">Data Pendaftaran</h2>
            <dl className="mt-2 divide-y divide-slate-100">
              <Row label="Tanggal Lahir">{p.tanggal_lahir}</Row>
              <Row label="Email">{p.email}</Row>
              <Row label="WhatsApp">{p.no_whatsapp}</Row>
              <Row label="Alamat">{p.alamat}</Row>
              <Row label="Asal Institusi">{p.asal_institusi}</Row>
              <Row label="Program"><span className="capitalize">{p.program}</span></Row>
              <Row label="Jenis Kelas">{p.jenis_kelas}</Row>
              <Row label="Motivasi">{p.pesan_motivasi}</Row>
              <Row label="Tanggal Daftar">{p.tanggal_daftar}</Row>
              {p.diverifikasi_oleh && <Row label="Diproses oleh">{p.diverifikasi_oleh} · {p.diverifikasi_pada}</Row>}
              {p.catatan_verifikasi && <Row label="Catatan Perbaikan">{p.catatan_verifikasi}</Row>}
            </dl>
          </section>

          {/* bukti pembayaran */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#0f1b2d]">Bukti Pembayaran</h2>
              <span className="text-lg font-extrabold text-[#b91c1c]">{rupiah(p.biaya)}</span>
            </div>
            <div className="mt-3 overflow-hidden rounded-xl bg-[#eef3fd]">
              {!p.has_bukti ? (
                <p className="px-4 py-12 text-center text-sm text-slate-600">
                  Calon murid belum mengunggah bukti pembayaran.
                </p>
              ) : p.bukti_is_pdf ? (
                <iframe src={p.bukti_url} title="Bukti pembayaran" className="h-[480px] w-full" />
              ) : (
                <a href={p.bukti_url} target="_blank" rel="noreferrer">
                  <img src={p.bukti_url} alt="Bukti pembayaran" className="max-h-[480px] w-full object-contain" />
                </a>
              )}
            </div>
            {p.has_bukti && (
              <a href={p.bukti_url} target="_blank" rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#b91c1c] hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Buka di tab baru
              </a>
            )}
          </section>
        </div>

        {/* aksi */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {p.bisa_diproses && (
            <button onClick={() => setShowVerif(true)}
              className="flex items-center gap-2 rounded-lg bg-[#0f1b2d] px-6 py-3 text-sm font-bold text-white hover:bg-[#16263d]">
              <BadgeCheck className="h-4 w-4" /> Verifikasi
            </button>
          )}
          {p.status === 'menunggu_verifikasi' && (
            <button onClick={() => setShowTolak(true)}
              className="flex items-center gap-2 rounded-lg bg-[#b91c1c] px-6 py-3 text-sm font-bold text-white hover:bg-[#991b1b]">
              <XCircle className="h-4 w-4" /> Tolak
            </button>
          )}
          {p.status === 'menunggu_verifikasi' && !p.has_bukti && (
            <p className="rounded-lg bg-[#eef3fd] p-3 text-sm text-slate-600">
              Bukti pembayaran belum diunggah. Minta calon murid melengkapi berkasnya.
            </p>
          )}
          {p.status !== 'menunggu_verifikasi' && (
            <p className="rounded-lg bg-[#eef3fd] p-3 text-sm text-slate-600">Pendaftaran ini sudah diproses.</p>
          )}
        </div>
      </div>

      {/* modal konfirmasi verifikasi */}
      {showVerif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1b2d]/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#0f1b2d]">Verifikasi pendaftaran?</h3>
            <p className="mt-2 text-sm text-slate-600">Status menjadi Terverifikasi dan akun murid akan diaktifkan.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowVerif(false)} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">
                <X className="h-4 w-4" /> Batal
              </button>
              <button onClick={verifikasi} disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f1b2d] px-5 py-2 text-sm font-bold text-white disabled:opacity-60">
                <BadgeCheck className="h-4 w-4" /> {busy ? 'Memproses...' : 'Ya, Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal form catatan penolakan */}
      {showTolak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1b2d]/60 p-4">
          <form onSubmit={tolak} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#0f1b2d]">Tolak pendaftaran</h3>
            <p className="mt-2 text-sm text-slate-600">
              Tuliskan catatan perbaikan sesuai kondisi yang perlu diperbaiki.
            </p>
            <textarea rows={5} value={data.catatan_verifikasi}
              onChange={(e) => setData('catatan_verifikasi', e.target.value)}
              className={`mt-4 w-full rounded-lg border bg-[#f4f7fc] p-3 text-sm ${errors.catatan_verifikasi ? 'border-red-400' : 'border-[#e6ebf5]'}`}
              placeholder="Contoh: Bukti transfer tidak terbaca, mohon kirim ulang foto yang lebih jelas." />
            {errors.catatan_verifikasi && <p className="mt-1.5 text-xs text-red-600">{errors.catatan_verifikasi}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={tutupTolak} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">
                <X className="h-4 w-4" /> Batal
              </button>
              <button disabled={processing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#b91c1c] px-5 py-2 text-sm font-bold text-white disabled:opacity-60">
                <Send className="h-4 w-4" /> {processing ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>
        </div>
      )}

    </AdminLayout>
  );
}
