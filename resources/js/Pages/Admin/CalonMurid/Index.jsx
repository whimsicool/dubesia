import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Clock, BadgeCheck, XCircle } from '@/Components/Icons';
import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import PageBreadcrumbs from '@/Components/Admin/PageBreadcrumbs';

const kartu = [
  { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi', icon: Clock, warna: 'bg-amber-100 text-amber-700' },
  { key: 'terverifikasi', label: 'Terverifikasi', icon: BadgeCheck, warna: 'bg-emerald-100 text-emerald-700' },
  { key: 'ditolak', label: 'Ditolak', icon: XCircle, warna: 'bg-red-100 text-[#b91c1c]' },
];

export default function Index({ pendaftarans, filters, statuses, ringkasan, flash }) {
  const [q, setQ] = useState(filters.q ?? '');
  const [status, setStatus] = useState(filters.status ?? '');

  const kirim = (params) =>
    router.get(route('admin.calon-murid.index'), params, { preserveState: true, replace: true });

  return (
    <AdminLayout title="Verifikasi Pendaftaran"
    >
      <Head title="Verifikasi Pendaftaran" />
      <PageBreadcrumbs className="mb-2" items={[
        { label: 'Dashboard Admin', route: 'admin.dashboard' },
        { label: 'Calon Murid', current: true, route: 'admin.calon-murid.index' },
      ]} />
      <div>

        {flash?.sukses && <div className={`mt-2 rounded-lg p-3 text-sm font-medium ${flash.sukses.startsWith('Pendaftaran ditolak') ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{flash.sukses}</div>}
        {flash?.peringatan && <div className="mt-2 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-800">{flash.peringatan}</div>}

        {/* ringkasan status, bisa diklik untuk memfilter */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kartu.map((k) => (
            <button key={k.key} type="button"
              onClick={() => { setStatus(k.key); kirim({ q, status: k.key }); }}
              className={`flex items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm ${status === k.key ? 'ring-2 ring-[#0f1b2d]/30' : ''}`}>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${k.warna}`}>
                <k.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-2xl font-extrabold text-[#0f1b2d]">{ringkasan?.[k.key] ?? 0}</span>
                <span className="block text-xs text-slate-600">{k.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* pencarian dan filter */}
        <form onSubmit={(e) => { e.preventDefault(); kirim({ q, status }); }} className="mt-5 flex flex-wrap gap-2">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#e6ebf5] bg-white px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email"
              className="w-full border-0 bg-transparent py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0" />
          </div>
          <select value={status}
            onChange={(e) => { setStatus(e.target.value); kirim({ q, status: e.target.value }); }}
            className="rounded-lg border border-[#e6ebf5] bg-white px-3 py-2.5 text-sm">
            <option value="">Semua status</option>
            {Object.entries(statuses).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="rounded-lg bg-[#0f1b2d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#16263d]">Cari</button>
        </form>

        {/* tabel */}
        <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#eef3fd] text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Calon Murid</th>
                <th className="px-4 py-3">Program</th>
                <th className="px-4 py-3">Tanggal Daftar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendaftarans.data.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Belum ada data pendaftaran.</td></tr>
              )}
              {pendaftarans.data.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0f1b2d]">{p.nama_lengkap}</p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{p.program}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{p.tanggal_daftar}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={p.status} label={p.status_label} />
                      {p.perbaikan_baru && <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-800">Perbaikan Baru</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={route('admin.calon-murid.show', p.id)} className="text-sm font-bold text-[#b91c1c] hover:underline">
                      Lihat Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* paginasi */}
        {pendaftarans.last_page > 1 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {pendaftarans.links.map((l, i) => (
              <Link key={i} href={l.url ?? '#'} preserveScroll
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  l.active ? 'bg-[#0f1b2d] text-white' : 'bg-white text-slate-700'
                } ${!l.url ? 'pointer-events-none opacity-40' : ''}`}
                dangerouslySetInnerHTML={{ __html: l.label }} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
