const styles = {
  menunggu_verifikasi: 'bg-amber-100 text-amber-800',
  terverifikasi: 'bg-emerald-100 text-emerald-800',
  ditolak: 'bg-red-100 text-[#b91c1c]',
};

export default function StatusBadge({ status, label }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}