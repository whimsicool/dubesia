import { CircleCheck, TriangleAlert } from 'lucide-react';
import Modal from '@/Components/Admin/Modal';
import RoomIcon from './RoomIcon';
import { DAY_NAMES } from './constants';

function SessionBox({ schedule, onEdit }) {
    return (
        <button
            type="button"
            onClick={() => onEdit(schedule)}
            className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-900"
        >
            <p className="text-xs font-bold text-red-700">
                {schedule.start_time} - {schedule.end_time}
            </p>
            <p className="mt-1 font-semibold text-slate-900">{schedule.title}</p>
            <p className="text-xs text-slate-500">{schedule.class_name}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                <RoomIcon type={schedule.room.type} /> {schedule.room.name} • {schedule.instructor.name}
            </p>
        </button>
    );
}

export default function ConflictModal({ open, onClose, conflicts, onEdit }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            title="Audit Bentrok Jadwal"
            description="Pasangan sesi yang jamnya beririsan dan memakai instruktur, ruang, atau murid yang sama. Klik sesi untuk mengubahnya."
        >
            {conflicts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <CircleCheck className="h-10 w-10 text-emerald-600" />
                    <p className="font-semibold text-slate-900">Tidak ada bentrok jadwal</p>
                    <p className="text-sm text-slate-500">Semua sesi pada semester ini aman.</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {conflicts.map((c, i) => (
                        <li key={`${c.a.id}-${c.b.id}-${i}`} className="rounded-2xl bg-red-50/60 p-4">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <TriangleAlert className="h-4 w-4 text-red-700" />
                                <span className="text-sm font-bold text-slate-900">{DAY_NAMES[c.day_of_week]}</span>
                                {c.reasons.map((r) => (
                                    <span key={r} className="rounded-full bg-red-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                                        {r}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <SessionBox schedule={c.a} onEdit={onEdit} />
                                <SessionBox schedule={c.b} onEdit={onEdit} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
}
