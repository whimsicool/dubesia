import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

export default function Result({ hasilTes, totalSoal, showDashboardButton = false }) {
    // Level configuration & descriptions
    const levelConfigs = {
        'Upper Intermediate': {
            badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
            bgGradient: 'from-purple-900 via-indigo-900 to-slate-900',
            accentColor: 'text-purple-600',
            progressBar: 'bg-purple-600',
            desc: 'Kemampuan bahasa Inggris tingkat mahir. Mampu memahami teks kompleks dan berkomunikasi secara fasih dengan penutur asli.',
            rekomendasi: [
                'Kelas Business English & Professional Communication',
                'Advanced IELTS / TOEFL Preparation (Target Band 7.5+)',
                'Academic Writing & Public Speaking Mastery',
            ],
        },
        'Middle Intermediate': {
            badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
            bgGradient: 'from-blue-900 via-indigo-950 to-slate-900',
            accentColor: 'text-blue-600',
            progressBar: 'bg-blue-600',
            desc: 'Kemampuan bahasa Inggris menengah atas. Memahami poin-poin utama percakapan standar dan mampu menyusun argumen yang terstruktur.',
            rekomendasi: [
                'Kelas Intermediate Conversation & Debate',
                'Comprehensive Grammar & Idiomatic Expressions',
                'TOEFL ITP / IELTS Preparation Class',
            ],
        },
        'Low Intermediate': {
            badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            bgGradient: 'from-emerald-950 via-teal-950 to-slate-900',
            accentColor: 'text-emerald-600',
            progressBar: 'bg-emerald-600',
            desc: 'Kemampuan bahasa Inggris menengah dasar. Mampu berkomunikasi dalam situasi sehari-hari dan memahami bacaan umum dengan baik.',
            rekomendasi: [
                'Kelas Fluency Booster & Daily Conversation',
                'Active Vocabulary & Sentence Construction',
                'Reading Comprehension & Listening Focus',
            ],
        },
        Beginner: {
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
            bgGradient: 'from-amber-950 via-slate-900 to-slate-900',
            accentColor: 'text-amber-600',
            progressBar: 'bg-amber-600',
            desc: 'Tahap awal pembelajaran bahasa Inggris. Disarankan memperkuat fondasi dasar tata bahasa dan perbendaharaan kata dasar.',
            rekomendasi: [
                'Kelas Basic English Grammar & Structure',
                'Pronunciation & Everyday Phrases Foundation',
                'Fundamental Vocabulary Building',
            ],
        },
    };

    const levelConfig = levelConfigs[hasilTes.level_kelas] || levelConfigs['Beginner'];

    // Format tanggal
    const formatTanggal = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Hitung akurasi
    const akurasi = totalSoal > 0 ? Math.round((hasilTes.jumlah_benar / totalSoal) * 100) : 0;

    return (
        <AdminLayout bare={showDashboardButton} compact>
            <Head title={`Hasil Tes Level - ${hasilTes.nama_murid}`} />

            <div className="py-3 sm:py-5 print:bg-white print:py-0">
                <div className="mx-auto w-full max-w-none">
                    {/* Print action stays available on both result views. */}
                    <div className="mb-3 flex justify-end print:hidden">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak / Simpan PDF
                            </button>
                        </div>
                    </div>

                    {/* Main Certificate / Result Card */}
                    <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200 print:shadow-none print:border-none">
                        {/* Header Banner */}
                        <div className={`relative bg-gradient-to-br ${levelConfig.bgGradient} p-6 sm:p-8 text-white`}>
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 transform skew-x-12"></div>
                            
                            <div className="relative z-10 text-center sm:text-left">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Laporan Hasil Tes Seleksi Level
                                </div>

                                <div className="sm:flex sm:items-center sm:justify-between gap-6">
                                    <div>
                                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                                            {hasilTes.nama_murid}
                                        </h1>
                                        <p className="mt-2 text-sm text-slate-300">
                                            DUBESIA English Course • Tanggal Tes: {formatTanggal(hasilTes.tanggal_tes)}
                                        </p>
                                    </div>

                                    {/* Big Score Box */}
                                    <div className="mt-6 sm:mt-0 flex flex-col items-center justify-center rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20">
                                        <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold">
                                            Skor Akhir
                                        </span>
                                        <span className="text-4xl sm:text-5xl font-black text-white mt-1">
                                            {hasilTes.nilai_tes}
                                        </span>
                                        <span className="text-[11px] text-slate-300 mt-0.5">
                                            Skala 0 - 100
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Level Result Badge Section */}
                        <div className="border-b border-slate-100 bg-slate-50/50 p-5 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                                        Level Kelas Direkomendasikan
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-base sm:text-lg font-bold border shadow-sm ${levelConfig.badgeClass}`}>
                                            ★ {hasilTes.level_kelas}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600 max-w-xl">
                                        {levelConfig.desc}
                                    </p>
                                </div>

                                {/* Criteria Scale Box */}
                                <div className="rounded-xl bg-white p-3.5 text-xs border border-slate-200 shadow-sm sm:max-w-xs w-full">
                                    <div className="font-semibold text-slate-700 mb-2 border-b pb-1">
                                        Standar Penilaian Level:
                                    </div>
                                    <div className="space-y-1 text-slate-600">
                                        <div className={`flex justify-between ${hasilTes.level_kelas === 'Beginner' ? 'font-bold text-amber-700' : ''}`}>
                                            <span>Beginner</span>
                                            <span>&lt; 80</span>
                                        </div>
                                        <div className={`flex justify-between ${hasilTes.level_kelas === 'Low Intermediate' ? 'font-bold text-emerald-700' : ''}`}>
                                            <span>Low Intermediate</span>
                                            <span>80 – 85</span>
                                        </div>
                                        <div className={`flex justify-between ${hasilTes.level_kelas === 'Middle Intermediate' ? 'font-bold text-blue-700' : ''}`}>
                                            <span>Middle Intermediate</span>
                                            <span>86 – 89</span>
                                        </div>
                                        <div className={`flex justify-between ${hasilTes.level_kelas === 'Upper Intermediate' ? 'font-bold text-purple-700' : ''}`}>
                                            <span>Upper Intermediate</span>
                                            <span>90 – 100</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Statistics Grid */}
                        <div className="p-5 sm:p-6">
                            <h2 className="text-base font-bold text-slate-900 mb-4">
                                Rincian Performa Tes
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                {/* Total Soal */}
                                <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500 font-medium">Total Soal</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalSoal}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Butir Soal</p>
                                </div>

                                {/* Benar */}
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                    <p className="text-xs text-emerald-700 font-medium">Jawaban Benar</p>
                                    <p className="text-2xl font-bold text-emerald-700 mt-1">{hasilTes.jumlah_benar}</p>
                                    <p className="text-[11px] text-emerald-600 mt-0.5">Soal</p>
                                </div>

                                {/* Salah */}
                                <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                                    <p className="text-xs text-rose-700 font-medium">Jawaban Salah</p>
                                    <p className="text-2xl font-bold text-rose-700 mt-1">{hasilTes.jumlah_salah}</p>
                                    <p className="text-[11px] text-rose-600 mt-0.5">Termasuk tidak dijawab</p>
                                </div>

                                {/* Akurasi */}
                                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                                    <p className="text-xs text-blue-700 font-medium">Tingkat Akurasi</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">{akurasi}%</p>
                                    <p className="text-[11px] text-blue-600 mt-0.5">Ketepatan Jawaban</p>
                                </div>
                            </div>

                            {/* Rekomendasi Program Kursus */}
                            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200/80">
                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                    Rekomendasi Modul Pembelajaran DUBESIA untuk Anda:
                                </h3>
                                <ul className="space-y-2">
                                    {levelConfig.rekomendasi.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Footer Notice */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                                <span>ID Verifikasi Hasil: #DTES-{hasilTes.id_hasil}-{hasilTes.id_murid}</span>
                                <span>DUBESIA English Assessment Engine</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action - Hidden in Print */}
                    {showDashboardButton && <div className="mt-5 flex justify-center gap-4 print:hidden">
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-6 py-3 text-sm font-semibold shadow-sm transition-all"
                        >
                            Masuk ke Dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>}
                </div>
            </div>
        </AdminLayout>
    );
}
