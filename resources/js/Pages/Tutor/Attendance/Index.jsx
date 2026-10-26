import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const statuses = ['Hadir', 'Izin', 'Sakit', 'Alpa'];

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${date}T00:00:00`));
}

export default function Index({
    levels,
    selectedLevel,
    attendanceDate,
    hasSavedAttendance,
    students,
    history,
}) {
    const { flash, errors: pageErrors } = usePage().props;
    const [showSuccess, setShowSuccess] = useState(Boolean(flash?.success));
    const [expandedDate, setExpandedDate] = useState(null);
    const [historyDraft, setHistoryDraft] = useState([]);
    const [savingHistory, setSavingHistory] = useState(false);
    const isLocked = hasSavedAttendance;
    const { data, setData, post, processing, errors, isDirty, defaults } = useForm({
        class_level: selectedLevel,
        attendance_date: attendanceDate,
        students: students.map((student) => ({ ...student })),
    });

    useEffect(() => {
        if (!flash?.success) {
            setShowSuccess(false);
            return undefined;
        }

        setShowSuccess(true);
        const timeout = window.setTimeout(() => setShowSuccess(false), 5000);
        return () => window.clearTimeout(timeout);
    }, [flash?.success]);

    const counts = data.students.reduce(
        (result, student) => {
            if (student.status) result[student.status] += 1;
            else result.empty += 1;
            return result;
        },
        { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0, empty: 0 },
    );

    function changeFilter(level, date) {
        if (isDirty && !window.confirm('Perubahan belum disimpan. Tinggalkan halaman ini?')) {
            return;
        }

        router.get(
            route('tutor.attendance.index'),
            { level, date },
            { preserveScroll: false, preserveState: false },
        );
    }

    function updateStudent(index, field, value) {
        const nextStudents = data.students.map((student, studentIndex) =>
            studentIndex === index
                ? { ...student, [field]: value }
                : student,
        );
        setData('students', nextStudents);
    }

    function markEveryonePresent() {
        setData(
            'students',
            data.students.map((student) => ({ ...student, status: 'Hadir' })),
        );
    }

    function submit(e) {
        e.preventDefault();
        post(route('tutor.attendance.store'), {
            preserveScroll: true,
            onSuccess: () => defaults(),
        });
    }

    function toggleHistoryDate(record) {
        if (expandedDate === record.date) {
            setExpandedDate(null);
            setHistoryDraft([]);
            return;
        }

        setExpandedDate(record.date);
        setHistoryDraft(record.students.map((student) => ({ ...student })));
    }

    function updateHistoryStudent(index, field, value) {
        setHistoryDraft((current) => current.map((student, studentIndex) =>
            studentIndex === index ? { ...student, [field]: value } : student,
        ));
    }

    function saveHistoryChanges(e, date) {
        e.preventDefault();
        setSavingHistory(true);
        router.patch(
            route('tutor.attendance.history.update'),
            {
                class_level: selectedLevel,
                attendance_date: date,
                students: historyDraft,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setExpandedDate(null);
                    setHistoryDraft([]);
                },
                onFinish: () => setSavingHistory(false),
            },
        );
    }

    return (
        <AdminLayout title="Presensi Kelas"
        >
            <Head title="Kelola Presensi" />

            <div className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <p className="max-w-2xl text-sm text-gray-600">
                                Pilih kelas dan tanggal, lalu isi status kehadiran
                                setiap murid.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href="#form-presensi"
                                className="rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
                            >
                                Isi presensi
                            </a>
                            <a
                                href="#riwayat-presensi"
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Riwayat
                            </a>
                        </div>
                    </div>

                    {showSuccess && flash?.success && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"
                        >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                                ✓
                            </span>
                            <span className="flex-1 pt-0.5">{flash.success}</span>
                            <button
                                type="button"
                                onClick={() => setShowSuccess(false)}
                                aria-label="Tutup notifikasi"
                                className="rounded px-1 text-lg leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
                            <div>
                                <label
                                    htmlFor="class-level"
                                    className="mb-1.5 block text-sm font-semibold text-gray-700"
                                >
                                    Kelas
                                </label>
                                <select
                                    id="class-level"
                                    value={selectedLevel}
                                    onChange={(e) =>
                                        changeFilter(e.target.value, attendanceDate)
                                    }
                                    className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                >
                                    {levels.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="attendance-date"
                                    className="mb-1.5 block text-sm font-semibold text-gray-700"
                                >
                                    Tanggal presensi
                                </label>
                                <input
                                    id="attendance-date"
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) =>
                                        changeFilter(selectedLevel, e.target.value)
                                    }
                                    className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                />
                            </div>
                            <div className="text-sm text-gray-600 lg:pb-2">
                                <span className="font-semibold text-[#15243a]">
                                    {formatDate(attendanceDate)}
                                </span>
                                <span className="mt-1 block">Kelas {selectedLevel}</span>
                            </div>
                            <div className="lg:pb-2 lg:text-right">
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf0fa] px-3 py-1.5 text-xs font-semibold text-[#1c3150]">
                                    <span className="h-2 w-2 rounded-full bg-red-600" />
                                    Kelas terpilih
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {[
                            ['Total murid', data.students.length, 'bg-red-50 text-red-700'],
                            ['Hadir', counts.Hadir, 'bg-emerald-50 text-emerald-700'],
                            ['Izin', counts.Izin, 'bg-amber-50 text-amber-700'],
                            ['Sakit', counts.Sakit, 'bg-sky-50 text-sky-700'],
                            ['Alpa / belum diisi', counts.Alpa + counts.empty, 'bg-rose-50 text-rose-700'],
                        ].map(([label, value, color]) => (
                            <div
                                key={label}
                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                            >
                                <p className="text-xs font-medium text-gray-500">{label}</p>
                                <p className={`mt-2 inline-flex min-w-9 items-center justify-center rounded-lg px-2 py-1 text-xl font-bold ${color}`}>
                                    {value}
                                </p>
                            </div>
                        ))}
                    </section>

                    <section
                        id="form-presensi"
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                        <div className="flex flex-col justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="font-bold text-[#15243a]">
                                    Daftar murid · {selectedLevel}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    {isLocked
                                        ? 'Presensi tanggal ini sudah tersimpan dan terkunci.'
                                        : 'Isi status kehadiran setiap murid, lalu simpan.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isLocked && (
                                    <button
                                        type="button"
                                        onClick={markEveryonePresent}
                                        disabled={data.students.length === 0}
                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Tandai semua hadir
                                    </button>
                                )}
                            </div>
                        </div>

                        {errors.students && (
                            <p className="mx-5 mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                {errors.students}
                            </p>
                        )}

                        {data.students.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-xl text-red-700">
                                    ♧
                                </div>
                                <h3 className="mt-3 font-semibold text-[#15243a]">
                                    Belum ada murid di kelas {selectedLevel}
                                </h3>
                                <p className="mx-auto mt-1 max-w-lg text-sm text-gray-500">
                                    Murid perlu memiliki role Student dan level kelas
                                    yang sesuai sebelum bisa dicatat presensinya.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submit}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-[#f2f5fa]">
                                            <tr>
                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Murid
                                                </th>
                                                <th className="w-52 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Status
                                                </th>
                                                <th className="min-w-56 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Catatan
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.students.map((student, index) => (
                                                <tr key={student.id} className="hover:bg-[#f2f5fa]/70">
                                                    <td className="whitespace-nowrap px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-xs font-bold text-red-700">
                                                                {student.name
                                                                    .split(' ')
                                                                    .slice(0, 2)
                                                                    .map((part) => part[0])
                                                                    .join('')}
                                                            </span>
                                                            <div>
                                                                <p className="text-sm font-semibold text-[#15243a]">
                                                                    {student.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Murid {selectedLevel}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <select
                                                            aria-label={`Status kehadiran ${student.name}`}
                                                            value={student.status ?? ''}
                                                            disabled={isLocked}
                                                            onChange={(e) =>
                                                                updateStudent(index, 'status', e.target.value)
                                                            }
                                                            className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                                        >
                                                            <option value="">Pilih status</option>
                                                            {statuses.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errors[`students.${index}.status`] && (
                                                            <p className="mt-1 text-xs text-rose-600">
                                                                {errors[`students.${index}.status`]}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <input
                                                            type="text"
                                                            value={student.notes ?? ''}
                                                            readOnly={isLocked}
                                                            onChange={(e) =>
                                                                updateStudent(index, 'notes', e.target.value)
                                                            }
                                                            maxLength={500}
                                                            placeholder="Contoh: izin keluarga"
                                                            aria-label={`Catatan untuk ${student.name}`}
                                                            className="block w-full rounded-lg border-gray-300 text-sm shadow-sm placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col justify-between gap-3 border-t border-gray-200 bg-[#f2f5fa] px-5 py-4 sm:flex-row sm:items-center">
                                    {isLocked ? (
                                        <p className="text-sm text-gray-600">
                                            Mau mengubah data? Buka tanggalnya di riwayat, lalu pilih <strong>Ubah presensi</strong>.
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-[#15243a]">
                                                    {data.students.length - counts.empty} dari {data.students.length}
                                                </span>{' '}
                                                murid sudah diberi status
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={processing || data.students.length === 0}
                                                className="inline-flex justify-center rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {processing ? 'Menyimpan...' : 'Simpan presensi →'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </form>
                        )}
                    </section>

                    <section
                        id="riwayat-presensi"
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="font-bold text-[#15243a]">Riwayat presensi</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Pilih tanggal untuk membuka daftar nama dan status murid. Presensi tersimpan terkunci sampai kamu memilih ubah.
                                </p>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                                Kelas {selectedLevel}
                            </span>
                        </div>

                        {history.length === 0 ? (
                            <p className="mt-5 rounded-lg bg-[#f2f5fa] px-4 py-5 text-sm text-gray-500">
                                Belum ada presensi tersimpan untuk kelas ini.
                            </p>
                        ) : (
                            <div className="mt-4 divide-y divide-gray-100">
                                {history.map((record) => (
                                    <div
                                        key={record.date}
                                        className="py-3"
                                    >
                                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                            <div>
                                                <p className="text-sm font-semibold text-[#15243a]">
                                                    {formatDate(record.date)}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {record.hadir} hadir · {record.izin} izin ·{' '}
                                                    {record.sakit} sakit · {record.alpa} alpa
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                aria-expanded={expandedDate === record.date}
                                                onClick={() => toggleHistoryDate(record)}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                {expandedDate === record.date ? 'Tutup / batal' : 'Lihat / ubah'}
                                            </button>
                                        </div>
                                        {expandedDate === record.date && (
                                            <div className="mt-4 rounded-lg border border-gray-200 bg-[#f2f5fa] p-4">
                                                <p className="mb-3 text-sm font-medium text-gray-700">
                                                    Ubah status atau catatan murid untuk {formatDate(record.date)} langsung di sini.
                                                </p>
                                                {pageErrors?.students && (
                                                    <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                                        {pageErrors.students}
                                                    </p>
                                                )}
                                                <form onSubmit={(e) => saveHistoryChanges(e, record.date)}>
                                                    <div className="divide-y divide-gray-200">
                                                        {historyDraft.map((student, index) => (
                                                            <div
                                                                key={student.id}
                                                                className="grid gap-3 py-3 first:pt-0 last:pb-0 md:grid-cols-[minmax(10rem,1fr)_12rem_minmax(12rem,1.5fr)] md:items-center"
                                                            >
                                                                <p className="text-sm font-semibold text-[#15243a]">
                                                                    {student.name}
                                                                </p>
                                                                <select
                                                                    aria-label={`Status kehadiran ${student.name}`}
                                                                    value={student.status}
                                                                    onChange={(e) => updateHistoryStudent(index, 'status', e.target.value)}
                                                                    className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                                                >
                                                                    {statuses.map((status) => (
                                                                        <option key={status} value={status}>{status}</option>
                                                                    ))}
                                                                </select>
                                                                <input
                                                                    type="text"
                                                                    value={student.notes ?? ''}
                                                                    onChange={(e) => updateHistoryStudent(index, 'notes', e.target.value)}
                                                                    maxLength={500}
                                                                    placeholder="Catatan (opsional)"
                                                                    aria-label={`Catatan untuk ${student.name}`}
                                                                    className="block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
                                                        <button
                                                            type="submit"
                                                            disabled={savingHistory}
                                                            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                                                        >
                                                            {savingHistory ? 'Menyimpan...' : 'Simpan perubahan'}
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
            </div>
        </AdminLayout>
    );
}
