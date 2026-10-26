import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

export default function TakeTest({ soalList, jawabanTersimpan = {}, sisaDetik: initialSisaDetik, tesAktif, totalSoal }) {
    // Current question index (0 to totalSoal - 1)
    const [currentIndex, setCurrentIndex] = useState(0);

    // State of all answers: { [kode_soal]: { jawaban: 'A', status_tandai: false } }
    const [answers, setAnswers] = useState(() => {
        const initial = {};
        if (jawabanTersimpan && typeof jawabanTersimpan === 'object') {
            Object.values(jawabanTersimpan).forEach((item) => {
                if (item && item.kode_soal) {
                    initial[item.kode_soal] = {
                        jawaban: item.jawaban_murid || null,
                        status_tandai: !!item.status_tandai,
                    };
                }
            });
        }
        return initial;
    });

    // Save status indicator: 'saved' | 'saving' | 'error'
    const [saveStatus, setSaveStatus] = useState('saved');

    // Timer countdown in seconds
    const [sisaWaktu, setSisaWaktu] = useState(initialSisaDetik || 45 * 60);

    // Submit confirmation modal state
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Current active question
    const currentSoal = soalList[currentIndex] || {};

    // Timer countdown effect
    useEffect(() => {
        if (sisaWaktu <= 0) {
            handleAutoSubmit();
            return;
        }

        const timer = setInterval(() => {
            setSisaWaktu((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sisaWaktu]);

    // Format MM:SS or HH:MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Auto submit when time runs out
    const handleAutoSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        router.post(route('tes-level.submit'), {}, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Handle picking an answer (autosave via AJAX)
    const handleSelectOption = async (optionKey) => {
        if (isSubmitting || !currentSoal.kode_soal) return;

        const kode = currentSoal.kode_soal;
        const currentData = answers[kode] || {};

        // Update local state immediately for snappy UI
        setAnswers((prev) => ({
            ...prev,
            [kode]: {
                ...currentData,
                jawaban: optionKey,
            },
        }));

        setSaveStatus('saving');
        try {
            await axios.post(route('tes-level.auto-save'), {
                kode_soal: kode,
                jawaban_murid: optionKey,
            });
            setSaveStatus('saved');
        } catch (error) {
            console.error('Gagal menyimpan jawaban:', error);
            setSaveStatus('error');
        }
    };

    // Handle toggle tandai ragu-ragu
    const handleToggleTandai = async () => {
        if (isSubmitting || !currentSoal.kode_soal) return;

        const kode = currentSoal.kode_soal;
        const currentData = answers[kode] || {};
        const newStatus = !currentData.status_tandai;

        // Update local state immediately
        setAnswers((prev) => ({
            ...prev,
            [kode]: {
                ...currentData,
                status_tandai: newStatus,
            },
        }));

        try {
            await axios.post(route('tes-level.toggle-tandai'), {
                kode_soal: kode,
                status_tandai: newStatus,
            });
        } catch (error) {
            console.error('Gagal mengubah status ragu-ragu:', error);
        }
    };

    // Calculate answer stats
    const stats = useMemo(() => {
        let dijawab = 0;
        let raguRagu = 0;

        soalList.forEach((s) => {
            const data = answers[s.kode_soal];
            if (data?.jawaban) dijawab++;
            if (data?.status_tandai) raguRagu++;
        });

        const belumDijawab = totalSoal - dijawab;
        const persentase = totalSoal > 0 ? Math.round((dijawab / totalSoal) * 100) : 0;

        return { dijawab, belumDijawab, raguRagu, persentase };
    }, [answers, soalList, totalSoal]);

    // Manual submit by user
    const handleSubmitTest = () => {
        setIsSubmitting(true);
        router.post(route('tes-level.submit'), {}, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    const isLastQuestion = currentIndex === totalSoal - 1;
    const isFirstQuestion = currentIndex === 0;
    const currentJawaban = answers[currentSoal.kode_soal]?.jawaban;
    const currentIsTandai = !!answers[currentSoal.kode_soal]?.status_tandai;
    const isWaktuKritis = sisaWaktu < 300; // < 5 menit

    const pilihanList = [
        { key: 'A', text: currentSoal.pilihan_a },
        { key: 'B', text: currentSoal.pilihan_b },
        { key: 'C', text: currentSoal.pilihan_c },
        { key: 'D', text: currentSoal.pilihan_d },
    ];

    return (
        <AdminLayout>
            <Head title={`Tes Level - Soal No. ${currentIndex + 1}`} />

            <div className="pb-16 pt-4">
                <div className="mx-auto max-w-7xl">
                    {/* Top Sticky Test Bar */}
                    <div className="sticky top-2 z-20 mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 backdrop-blur-md">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Title & Progress Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm">
                                    ENG
                                </div>
                                <div>
                                    <h1 className="text-base font-bold text-slate-900">
                                        Tes Penempatan Level DUBESIA
                                    </h1>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>Progress: {stats.dijawab}/{totalSoal} Soal ({stats.persentase}%)</span>
                                        <span>•</span>
                                        {saveStatus === 'saving' && (
                                            <span className="flex items-center gap-1 text-amber-600">
                                                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                </svg>
                                                Menyimpan...
                                            </span>
                                        )}
                                        {saveStatus === 'saved' && (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Jawaban tersimpan otomatis
                                            </span>
                                        )}
                                        {saveStatus === 'error' && (
                                            <span className="text-rose-600 font-medium">Gagal simpan, coba lagi</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Timer & Finish Button */}
                            <div className="flex items-center gap-3">
                                {/* Countdown Clock */}
                                <div
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 border font-mono font-bold text-sm transition-all duration-300 ${
                                        isWaktuKritis
                                            ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                                            : 'bg-slate-100 border-slate-200 text-slate-800'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formatTime(sisaWaktu)}</span>
                                </div>

                                {/* Finish Test Button */}
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Selesaikan Tes
                                </button>
                            </div>
                        </div>

                        {/* Top Linear Progress Bar */}
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full bg-slate-900 transition-all duration-500 rounded-full"
                                style={{ width: `${stats.persentase}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Main Content: Two Columns Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Soal & Options (8 of 12 cols) */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200/80">
                                {/* Question Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 px-3 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
                                            Soal No. {currentIndex + 1}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">
                                            Kode: {currentSoal.kode_soal}
                                        </span>
                                    </div>

                                    {/* Tandai Ragu-ragu Toggle */}
                                    <button
                                        type="button"
                                        onClick={handleToggleTandai}
                                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 border ${
                                            currentIsTandai
                                                ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`h-4 w-4 ${currentIsTandai ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {currentIsTandai ? 'Ragu-ragu' : 'Tandai Ragu-ragu'}
                                    </button>
                                </div>

                                {/* Question Pertanyaan */}
                                <div className="mb-8">
                                    <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                                        {currentSoal.pertanyaan}
                                    </p>
                                </div>

                                {/* Pilihan Jawaban Cards (A, B, C, D) */}
                                <div className="space-y-3">
                                    {pilihanList.map((opsi) => {
                                        const isSelected = currentJawaban === opsi.key;

                                        return (
                                            <button
                                                key={opsi.key}
                                                type="button"
                                                onClick={() => handleSelectOption(opsi.key)}
                                                className={`w-full text-left rounded-xl p-4 sm:p-5 border transition-all duration-150 flex items-start gap-4 group ${
                                                    isSelected
                                                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                                }`}
                                            >
                                                {/* Key indicator badge */}
                                                <div
                                                    className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs transition-colors duration-150 ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {opsi.key}
                                                </div>

                                                {/* Text pilihan */}
                                                <div className="flex-1 pt-1 text-sm sm:text-base text-slate-800 leading-normal">
                                                    {opsi.text}
                                                </div>

                                                {/* Radio Circle */}
                                                <div className="flex-shrink-0 pt-1">
                                                    <div
                                                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                                                            isSelected
                                                                ? 'border-blue-600 bg-blue-600'
                                                                : 'border-slate-300 group-hover:border-slate-400'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <div className="h-2 w-2 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Navigasi Bawah: Sebelumnya & Berikutnya */}
                                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        disabled={isFirstQuestion}
                                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold border transition-all duration-150 ${
                                            isFirstQuestion
                                                ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 shadow-sm'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Sebelumnya
                                    </button>

                                    {isLastQuestion ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowSubmitModal(true)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150"
                                        >
                                            Kumpulkan Jawaban
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setCurrentIndex((prev) => Math.min(totalSoal - 1, prev + 1))}
                                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150"
                                        >
                                            Berikutnya
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Question Palette Grid (4 of 12 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/80">
                                <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                                    <span>Nomor Soal</span>
                                    <span className="text-xs font-normal text-slate-500">
                                        {stats.dijawab} dari {totalSoal} Selesai
                                    </span>
                                </h2>

                                {/* Legend Status */}
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-4 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-md bg-blue-600"></span>
                                        <span>Sudah Dijawab</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-md bg-amber-400"></span>
                                        <span>Ragu-ragu</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-md bg-slate-100 border border-slate-300"></span>
                                        <span>Belum Dijawab</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-md border-2 border-slate-900"></span>
                                        <span>Sedang Aktif</span>
                                    </div>
                                </div>

                                {/* Numbers Grid (1 to 40) */}
                                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1">
                                    {soalList.map((soal, idx) => {
                                        const itemData = answers[soal.kode_soal];
                                        const isAnswered = !!itemData?.jawaban;
                                        const isTandai = !!itemData?.status_tandai;
                                        const isCurrent = idx === currentIndex;

                                        let styleClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';

                                        if (isTandai) {
                                            styleClass = 'bg-amber-400 text-slate-900 font-bold hover:bg-amber-500 border-amber-400';
                                        } else if (isAnswered) {
                                            styleClass = 'bg-blue-600 text-white font-bold hover:bg-blue-700 border-blue-600';
                                        }

                                        if (isCurrent) {
                                            styleClass += ' ring-2 ring-slate-900 ring-offset-2';
                                        }

                                        return (
                                            <button
                                                key={soal.kode_soal}
                                                type="button"
                                                onClick={() => setCurrentIndex(idx)}
                                                className={`relative h-10 w-full rounded-xl border text-xs font-semibold flex items-center justify-center transition-all duration-150 active:scale-90 ${styleClass}`}
                                            >
                                                {idx + 1}
                                                {isTandai && (
                                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-600 border border-white"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Quick Summary Box */}
                                <div className="mt-5 rounded-xl bg-slate-50 p-3.5 text-xs space-y-1.5 border border-slate-200/60">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Soal Terjawab:</span>
                                        <span className="font-bold text-slate-900">{stats.dijawab}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Belum Dijawab:</span>
                                        <span className="font-bold text-slate-900">{stats.belumDijawab}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Ragu-ragu:</span>
                                        <span className="font-bold text-amber-700">{stats.raguRagu}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Submit */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 transition-all transform scale-100">
                        <div className="flex items-center gap-3 text-slate-900 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Konfirmasi Pengumpulan Tes
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pastikan seluruh jawaban Anda telah diperiksa.
                                </p>
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="mb-5 space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Total Soal:</span>
                                <span className="font-semibold text-slate-900">{totalSoal} Butir</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Sudah Dijawab:</span>
                                <span className="font-semibold text-emerald-600">{stats.dijawab} Soal</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Belum Dijawab:</span>
                                <span className={`font-semibold ${stats.belumDijawab > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {stats.belumDijawab} Soal
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Ditandai Ragu-ragu:</span>
                                <span className={`font-semibold ${stats.raguRagu > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                    {stats.raguRagu} Soal
                                </span>
                            </div>
                        </div>

                        {stats.belumDijawab > 0 && (
                            <div className="mb-5 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>
                                    Peringatan: Masih terdapat <strong>{stats.belumDijawab} soal</strong> yang belum dijawab. Soal yang tidak dijawab akan dihitung sebagai salah.
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setShowSubmitModal(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Periksa Kembali
                            </button>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={handleSubmitTest}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    'Ya, Kumpulkan Sekarang'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
