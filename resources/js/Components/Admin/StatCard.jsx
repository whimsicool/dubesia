/** Kartu statistik ringkas di atas tabel admin. */
export default function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                {Icon && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <Icon className="h-4 w-4" />
                    </span>
                )}
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
    );
}
