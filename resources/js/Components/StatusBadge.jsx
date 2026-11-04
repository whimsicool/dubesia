const styles = {
  menunggu_pembayaran: 'bg-sky-100 text-sky-800',
  menunggu_verifikasi: 'bg-amber-100 text-amber-800',
  terverifikasi: 'bg-emerald-100 text-emerald-800',
  ditolak: 'bg-red-100 text-[#b91c1c]',
};

export default function StatusBadge({ status, label }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}
