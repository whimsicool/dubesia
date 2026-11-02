import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ClipboardCheck, Search } from 'lucide-react';

const STATUS = {
    present: { label: 'Hadir', className: 'bg-emerald-50 text-emerald-700' },
    permit: { label: 'Izin', className: 'bg-amber-50 text-amber-700' },
    sick: { label: 'Sakit', className: 'bg-sky-50 text-sky-700' },
    absent: { label: 'Alpa', className: 'bg-rose-50 text-rose-700' },
};

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

export default function Index({ history = [] }) {
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(null);
    const filteredHistory = useMemo(() => {
        const search = query.trim().toLocaleLowerCase('id-ID');
        if (!search) return history;
        return history.filter((session) => [session.schedule?.title, session.schedule?.class_name, session.schedule?.room, session.date, ...session.students.map((student) => student.name)].filter(Boolean).some((value) => String(value).toLocaleLowerCase('id-ID').includes(search)));
    }, [history, query]);

    return (
        <AdminLayout title="Riwayat Presensi" subtitle="Lihat catatan presensi yang telah diisi tutor pada setiap jadwal mengajar.">
            <Head title="Riwayat Presensi" />
            <div className="space-y-5">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        ['Sesi tercatat', history.length, 'text-slate-900'],
                        ['Hadir', history.reduce((sum, item) => sum + item.counts.present, 0), 'text-emerald-700'],
                        ['Izin / Sakit', history.reduce((sum, item) => sum + item.counts.permit + item.counts.sick, 0), 'text-amber-700'],
                        ['Alpa', history.reduce((sum, item) => sum + item.counts.absent, 0), 'text-rose-700'],
                    ].map(([label, value, color]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-2 text-2xl font-extrabold ${color}`}>{value}</p></div>)}
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kelas, jadwal, tanggal, atau nama murid..." className="w-full rounded-lg border-slate-200 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-blue-500" /></label>
                </section>
                {filteredHistory.length === 0 ? (
                    <section className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm"><ClipboardCheck className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-3 font-bold text-slate-800">{history.length ? 'Riwayat tidak ditemukan' : 'Belum ada riwayat presensi'}</h2><p className="mt-1 text-sm text-slate-500">{history.length ? 'Coba gunakan kata pencarian lain.' : 'Presensi yang disimpan tutor melalui menu Jadwal Mengajar akan muncul di sini.'}</p></section>
                ) : (
                    <div className="space-y-3">
                        {filteredHistory.map((session) => {
                            const key = `${session.schedule.id}-${session.date}`;
                            const isOpen = expanded === key;
                            return <article key={key} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <button type="button" onClick={() => setExpanded(isOpen ? null : key)} aria-expanded={isOpen} className="flex w-full flex-col gap-4 p-4 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3"><span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-700"><CalendarDays className="h-5 w-5" /></span><div className="min-w-0"><p className="font-bold text-slate-900">{session.schedule.title}</p><p className="mt-0.5 text-sm text-slate-600">{session.schedule.class_name} · {session.schedule.room ? `Ruang ${session.schedule.room}` : 'Ruang belum ditentukan'}</p><p className="mt-1 text-xs text-slate-500">{formatDate(session.date)} · {session.schedule.start_time}–{session.schedule.end_time}</p></div></div>
                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">{Object.entries(STATUS).map(([status, meta]) => session.counts[status] > 0 && <span key={status} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}: {session.counts[status]}</span>)}<span className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">{session.students.length} murid <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} /></span></div>
                                </button>
                                {isOpen && <div className="border-t border-slate-100"><div className="grid grid-cols-[1fr_auto] bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500"><span>Murid</span><span>Status presensi</span></div>{session.students.map((student) => { const status = STATUS[student.status] ?? { label: 'Belum diisi', className: 'bg-slate-100 text-slate-500' }; return <div key={student.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-slate-100 px-4 py-3"><div><p className="text-sm font-semibold text-slate-800">{student.name}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></div>; })}</div>}
                            </article>;
                        })}
                    </div>
                )}
                <p className="text-sm text-slate-500">Menampilkan {filteredHistory.length} dari {history.length} sesi presensi.</p>
            </div>
        </AdminLayout>
    );
}
