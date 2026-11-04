import { Head, router } from '@inertiajs/react';
import { Download, Wallet } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageBreadcrumbs from '@/Components/Admin/PageBreadcrumbs';

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const rupiah = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const selectClass =
  'min-w-[8.5rem] rounded-lg border border-[#e6ebf5] bg-white py-2.5 pl-3 pr-8 text-sm text-slate-800 focus:border-[#0f1b2d] focus:outline-none';

export default function Index({ pembayaran = [], total = 0, filters, periode_label, tahun_options = [] }) {
  const kirim = (patch) => {
    router.get(route('admin.pembayaran.index'), { ...filters, ...patch }, { preserveState: true, replace: true });
  };

  return (
    <AdminLayout title="Pembayaran Masuk">
      <Head title="Pembayaran Masuk" />

      <PageBreadcrumbs
        className="mb-3"
        items={[
          { label: 'Dashboard Admin', route: 'admin.dashboard' },
          { label: 'Pembayaran Masuk', current: true, route: 'admin.pembayaran.index' },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Wallet className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs text-slate-600">Total {periode_label}</span>
            <span className="block text-2xl font-extrabold text-[#0f1b2d]">{rupiah(total)}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <Wallet className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs text-slate-600">Murid terverifikasi</span>
            <span className="block text-2xl font-extrabold text-[#0f1b2d]">{pembayaran.length}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2 rounded-xl bg-white p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
          Periode
          <select
            value={filters.periode}
            onChange={(e) => kirim({ periode: e.target.value })}
            className={selectClass}
          >
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
        </label>

        {filters.periode === 'bulanan' && (
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Bulan
            <select
              value={filters.bulan}
              onChange={(e) => kirim({ bulan: Number(e.target.value) })}
              className={selectClass}
            >
              {BULAN.map((nama, index) => (
                <option key={nama} value={index + 1}>
                  {nama}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
          Tahun
          <select
            value={filters.tahun}
            onChange={(e) => kirim({ tahun: Number(e.target.value) })}
            className={selectClass}
          >
            {tahun_options.map((tahun) => (
              <option key={tahun} value={tahun}>
                {tahun}
              </option>
            ))}
          </select>
        </label>

        <a
          href={route('admin.pembayaran.pdf', filters)}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#0f1b2d] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#16263d]"
        >
          <Download className="h-4 w-4" /> Unduh PDF
        </a>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#eef3fd] text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Murid</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Tanggal Verifikasi</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pembayaran.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Belum ada pembayaran pada periode ini.
                </td>
              </tr>
            )}

            {pembayaran.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#0f1b2d]">{row.nama_lengkap}</p>
                  <p className="text-xs text-slate-500">{row.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{row.program}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.tanggal}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[#0f1b2d]">
                  {rupiah(row.biaya)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-[#eef3fd]">
              <td colSpan={4} className="px-4 py-3 text-right font-bold text-[#0f1b2d]">
                Total {periode_label}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-base font-extrabold text-[#0f1b2d]">
                {rupiah(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </AdminLayout>
  );
}
