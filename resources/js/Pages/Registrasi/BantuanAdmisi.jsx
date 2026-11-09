import { Link } from '@inertiajs/react';
import { ChevronDown, CircleHelp, FileText, UserRoundPlus } from 'lucide-react';

import AdmisiShell from '@/Components/Registrasi/AdmisiShell';

export default function BantuanAdmisi() {
    const faqs = [
        {
            question: 'Bagaimana cara mendaftar sebagai murid?',
            answer:
                'Buka halaman pendaftaran, lengkapi formulir, lalu kirim. Setelah itu kamu diarahkan ke halaman pembayaran untuk transfer dan mengunggah bukti pembayaran.',
        },
        {
            question: 'Berapa biaya pendaftaran dan bagaimana cara membayarnya?',
            answer:
                'Biaya mengikuti jenis kelas yang dipilih: Regular Rp 1.800.000, Private Rp 5.000.000, Intensive Rp 10.000.000, dan Home Visit Rp 7.000.000. Nominal dan rekening tujuan tampil pada halaman pembayaran. Unggah bukti transfer dalam format gambar atau PDF.',
        },
        {
            question: 'Kapan akun saya bisa dipakai untuk masuk?',
            answer:
                'Akun aktif setelah admin memverifikasi data dan bukti pembayaran. Kata sandi sementara dikirim ke email yang kamu daftarkan. Cek kotak masuk dan folder spam.',
        },
        {
            question: 'Saya sudah mengisi formulir, tetapi belum membayar. Apakah sudah terdaftar?',
            answer:
                'Belum. Pendaftaran diproses setelah bukti pembayaran diunggah. Tanpa pembayaran, data belum masuk antrean verifikasi admin.',
        },
        {
            question: 'Bagaimana kalau data pendaftaran saya salah?',
            answer:
                'Jika pendaftaran ditolak, halaman perbaikan terbuka dan kamu bisa memperbaiki data lalu mengirim ulang. Di luar alur itu, hubungi admin melalui WhatsApp untuk arahan.',
        },
        {
            question: 'Saya lupa kata sandi. Apa yang harus dilakukan?',
            answer:
                'Buka menu Lupa kata sandi di halaman masuk, lalu masukkan email terdaftar. Kata sandi baru hanya dikirim ke email yang sudah terverifikasi. Akun yang pendaftarannya belum selesai belum bisa memakai fitur ini.',
        },
        {
            question: 'Apa saja yang bisa saya lihat setelah masuk?',
            answer:
                'Portal menampilkan jadwal belajar, ruang kelas, materi, presensi, nilai, dan hasil tes level. Murid baru mengerjakan tes level terlebih dahulu.',
        },
    ];

    return (
        <AdmisiShell title="FAQ">
            <section className="rounded-3xl bg-gradient-to-r from-dubesia-red via-dubesia-red to-dubesia-navy px-6 py-10 text-white sm:px-10">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">Pertanyaan umum</p>
                <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">FAQ</h1>
                <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                    Temukan jawaban atas pertanyaan seputar pendaftaran, pembayaran, dan portal murid DUBESIA.
                </p>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-bold">Pertanyaan yang Sering Diajukan</h2>
                <div className="mt-5 space-y-4">
                    {faqs.map((faq) => (
                        <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                                <span className="inline-flex items-center gap-3">
                                    <CircleHelp aria-hidden="true" className="h-5 w-5 shrink-0 text-dubesia-red" />
                                    {faq.question}
                                </span>
                                <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                            </summary>
                            <p className="mt-4 leading-7 text-slate-600">{faq.answer}</p>
                        </details>
                    ))}
                </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h2 className="text-xl font-bold">Masih membutuhkan bantuan?</h2>
                <p className="mt-3 leading-7 text-slate-600">
                    Jika pertanyaanmu belum terjawab, hubungi tim admisi DUBESIA melalui WhatsApp.
                </p>
                <a
                    href="https://wa.me/6281312340221"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-3 rounded-xl text-slate-800 transition hover:text-emerald-700"
                >
                    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-10 w-10 shrink-0 text-emerald-600" fill="currentColor">
                        <path d="M16.02 3.2A12.7 12.7 0 0 0 5.1 22.38L3.4 28.6l6.36-1.67A12.7 12.7 0 1 0 16.02 3.2Zm0 23.1c-1.92 0-3.8-.51-5.44-1.49l-.39-.23-3.77.99 1.01-3.67-.25-.38a10.38 10.38 0 1 1 8.84 4.78Zm5.7-7.78c-.31-.16-1.84-.91-2.12-1.02-.28-.1-.49-.16-.7.16-.2.31-.8 1.02-.98 1.23-.18.2-.36.23-.67.08-.31-.16-1.31-.48-2.5-1.53-.92-.82-1.55-1.83-1.73-2.14-.18-.31-.02-.48.14-.63.14-.14.31-.36.46-.54.16-.18.21-.31.31-.52.1-.2.05-.39-.02-.54-.08-.16-.7-1.68-.96-2.3-.25-.6-.5-.52-.7-.53h-.6c-.2 0-.54.08-.82.39-.28.31-1.08 1.05-1.08 2.58s1.1 2.99 1.26 3.2c.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.75.65.74.23 1.41.2 1.94.12.59-.09 1.84-.75 2.1-1.48.26-.72.26-1.34.18-1.47-.08-.13-.28-.2-.59-.36Z" />
                    </svg>
                    <span className="font-semibold">Hubungi Admin</span>
                </a>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={route('registrasi.create')} className="inline-flex items-center gap-2 rounded-lg bg-dubesia-red px-5 py-3 text-sm font-semibold text-white hover:bg-dubesia-navy">
                        <UserRoundPlus aria-hidden="true" className="h-4 w-4" />
                        Kembali ke Pendaftaran
                    </Link>
                    <Link href={route('panduan-pendaftaran')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50">
                        <FileText aria-hidden="true" className="h-4 w-4" />
                        Lihat Panduan Pendaftaran
                    </Link>
                </div>
            </section>
        </AdmisiShell>
    );
}
