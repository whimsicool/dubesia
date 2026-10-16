import { CalendarRange, ClipboardCheck, DoorOpen, Users } from 'lucide-react';

function StatCard({ label, icon: Icon, children, footer }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase leading-snug tracking-wider text-slate-500">{label}</p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-[18px] w-[18px]" />
                </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">{children}</div>
            <p className="mt-3 text-sm text-slate-500">{footer}</p>
        </div>
    );
}

const Big = ({ children }) => <span className="text-4xl font-extrabold tracking-tight text-slate-900">{children}</span>;
const Unit = ({ children, accent }) => (
    <span className={`text-xs font-medium ${accent ? 'font-semibold text-red-700' : 'text-slate-500'}`}>{children}</span>
);

export default function StatCards({ stats }) {
    const attendance = stats.attendance_rate;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
            <StatCard
                label="Total sesi terjadwal"
                icon={CalendarRange}
                footer={
                    <>
                        <strong className="text-slate-700">{stats.programs} Program Aktif</strong> • {stats.instructors} Instruktur
                    </>
                }
            >
                <Big>{stats.sessions}</Big>
                <Unit>Sesi Belajar / Pekan</Unit>
            </StatCard>

            <StatCard
                label="Ruangan diplomasi terpakai"
                icon={DoorOpen}
                footer={
                    <>
                        <strong className="text-slate-700">{stats.rooms_physical} Fisik</strong> • {stats.rooms_online} Saluran Cloud
                    </>
                }
            >
                <Big>{stats.occupancy}%</Big>
                <Unit accent>Tingkat Okupansi</Unit>
            </StatCard>

            <StatCard
                label="Peserta terdaftar"
                icon={Users}
                footer={
                    <>
                        <strong className="text-red-700">{stats.pending} Murid Baru</strong> menunggu penempatan
                    </>
                }
            >
                <Big>{stats.enrolled}</Big>
                <Unit>Murid Terploting</Unit>
            </StatCard>

            <StatCard
                label="Status kehadiran hari ini"
                icon={ClipboardCheck}
                footer={`${stats.sessions_recorded_today} dari ${stats.sessions_today} sesi hari ini sudah tercatat presensi`}
            >
                <Big>{attendance === null ? '—' : `${attendance}%`}</Big>
                <Unit>Presensi Hadir</Unit>
            </StatCard>
        </div>
    );
}
