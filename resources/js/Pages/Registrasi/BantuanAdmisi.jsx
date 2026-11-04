import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function BantuanAdmisi() {
    const faqs = [
        {
            question: "Bagaimana cara mendaftar sebagai murid?",
            answer: "Buka halaman registrasi DUBESIA, lengkapi formulir dengan data yang benar, lalu kirim pendaftaran."
        },
        {
            question: "Bagaimana jika saya salah mengisi data?",
            answer: "Periksa kembali data sebelum mengirim formulir. Jika pendaftaran sudah dikirim, hubungi admin untuk meminta arahan perbaikan."
        },
        {
            question: "Mengapa pendaftaran saya belum diverifikasi?",
            answer: "Pendaftaran mungkin masih menunggu pemeriksaan admin. Pastikan data yang dikirim sudah lengkap dan benar."
        },
        {
            question: "Bagaimana mengetahui hasil verifikasi?",
            answer: "Ikuti informasi dan arahan yang diberikan oleh admin DUBESIA mengenai status pendaftaran."
        }
    ];

    return (
        <>
            <Head title="FAQ" />

            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <img src="/images/dubesia-logo.png" alt="Logo DUBESIA" className="h-10 w-10 rounded-full object-contain" />
                            <div>
                                <p className="font-bold text-slate-900">DUBESIA</p>
                                <p className="text-xs text-slate-500">FAQ DUBESIA</p>
                            </div>
                        </div>
                        <Link href={route('registrasi.create')} className="rounded-lg bg-dubesia-red px-4 py-2 text-sm font-semibold text-white hover:bg-dubesia-navy">
                            Daftar Sekarang
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
                    <section className="rounded-3xl bg-gradient-to-r from-dubesia-red via-dubesia-red to-dubesia-navy px-6 py-10 text-white sm:px-10">
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">Pertanyaan umum</p>
                        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">FAQ</h1>
                        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                            Temukan jawaban atas pertanyaan seputar proses pendaftaran murid DUBESIA.
                        </p>
                    </section>

                    <section className="mt-10">
                        <h2 className="text-xl font-bold">Pertanyaan yang Sering Diajukan</h2>
                        <div className="mt-5 space-y-4">
                            {faqs.map((faq, index) => (
                                <details key={index} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                                        {faq.question}
                                        <span className="text-xl text-slate-400 group-open:rotate-45">+</span>
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
                            <Link href={route('registrasi.create')} className="rounded-lg bg-dubesia-red px-5 py-3 text-sm font-semibold text-white hover:bg-dubesia-navy">
                                Kembali ke Registrasi
                            </Link>
                            <Link href={route('panduan-pendaftaran')} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50">
                                Lihat Panduan Pendaftaran
                            </Link>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} DUBESIA
                </footer>
            </div>
        </>
    );
}
