import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Play, X } from 'lucide-react';
import { useState } from 'react';

export default function Index({ totalSoal, durasiMenit, hasilTes, tesAktif }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const { post, processing } = useForm();

    const handleStartTes = () => {
        setShowConfirm(true);
    };

    const confirmStartTes = () => {
        post(route('tes-level.start'));
    };

    return (
        <AdminLayout title="Tes Level"
        >
            <Head title="Tes Level" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl">
                    {/* Header Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container via-on-surface to-primary-container p-8 text-white shadow-xl mb-8">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5"></div>
                        <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5"></div>

                        <div className="relative z-10">
                            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-4">
                                Tes Penempatan
                            </span>
                            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                Tes Penempatan Level
                            </h1>
                            <p className="text-white/80 text-sm max-w-2xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                Uji kemampuan bahasa Inggris Anda melalui tes pilihan ganda untuk menentukan level yang sesuai di DUBESIA.
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi Alokasi</p>
                                <p className="text-xl font-bold text-gray-900">{durasiMenit} Menit</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pertanyaan</p>
                                <p className="text-xl font-bold text-gray-900">{totalSoal} Butir</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                            <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Soal</p>
                                <p className="text-xl font-bold text-gray-900">Pilihan Ganda</p>
                            </div>
                        </div>
                    </div>

                    {/* Hasil Tes Sebelumnya */}
                    {hasilTes && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Hasil Tes Terakhir Anda
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center p-4 rounded-lg bg-blue-50">
                                    <p className="text-2xl font-bold text-blue-700">{hasilTes.nilai_tes}</p>
                                    <p className="text-xs text-blue-600 mt-1">Nilai Tes</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-emerald-50">
                                    <p className="text-2xl font-bold text-emerald-700">{hasilTes.jumlah_benar}</p>
                                    <p className="text-xs text-emerald-600 mt-1">Benar</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-red-50">
                                    <p className="text-2xl font-bold text-red-700">{hasilTes.jumlah_salah}</p>
                                    <p className="text-xs text-red-600 mt-1">Salah</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-amber-50">
                                    <p className="text-lg font-bold text-amber-700">{hasilTes.level_kelas}</p>
                                    <p className="text-xs text-amber-600 mt-1">Level Kelas</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Link
                                    href={route('tes-level.result', hasilTes.id_hasil)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                                >
                                    Lihat Detail Hasil
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Ketentuan & Regulasi */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ketentuan & Regulasi Tes</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Setiap jawaban yang dipilih akan langsung <strong>tersimpan otomatis</strong> secara real-time.</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>Bila waktu <strong>{durasiMenit} menit habis</strong>, sistem otomatis merekam seluruh jawaban dan menampilkan hasil evaluasi.</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                </svg>
                                <span>Klasifikasi level berdasarkan skor: <strong>&lt;80 = Beginner</strong>, <strong>80-85 = Low Intermediate</strong>, <strong>86-89 = Middle Intermediate</strong>, <strong>90-100 = Upper Intermediate</strong>.</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                                </svg>
                                <span>Soal yang dirasa ragu-ragu dapat <strong>ditandai untuk ditinjau ulang</strong> sebelum submit.</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center">
                        {tesAktif ? (
                            <Link
                                href={route('tes-level.take')}
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Lanjutkan Tes yang Sedang Berjalan
                            </Link>
                        ) : (
                            <button
                                onClick={handleStartTes}
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-container/30 transition-all duration-300 hover:bg-on-surface hover:shadow-xl hover:shadow-on-surface/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Mulai Tes Sekarang
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)}>
                    <div
                        className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-[fadeInScale_0.3s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Mulai Tes</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Anda akan memulai <strong>Tes Level</strong> dengan <strong>{totalSoal} soal</strong> dan durasi <strong>{durasiMenit} menit</strong>.
                                Timer akan berjalan setelah Anda menekan tombol mulai. Pastikan Anda siap.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                            >
                                <X className="h-4 w-4" /> Batal
                            </button>
                            <button
                                onClick={confirmStartTes}
                                disabled={processing}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-on-surface disabled:opacity-50"
                            >
                                <Play className="h-4 w-4" /> {processing ? 'Memulai...' : 'Ya, Mulai Tes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </AdminLayout>
    );
}
