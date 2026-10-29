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
            <Head title="Bantuan Admisi" />

            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <img src="/images/dubesia-logo.png" alt="Logo DUBESIA" className="h-10 w-10 rounded-full object-contain" />
                            <div>
                                <p className="font-bold text-slate-900">DUBESIA</p>
                                <p className="text-xs text-slate-500">Pusat Bantuan Admisi</p>
                            </div>
                        </div>
                        <Link href={route('registrasi.create')} className="rounded-lg bg-dubesia-red px-4 py-2 text-sm font-semibold text-white hover:bg-dubesia-navy">
                            Daftar Sekarang
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
                    <section className="rounded-3xl bg-gradient-to-r from-dubesia-red via-dubesia-red to-dubesia-navy px-6 py-10 text-white sm:px-10">
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">Pusat Bantuan</p>
                        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Bantuan Admisi</h1>
                        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                            Temukan informasi dan jawaban atas pertanyaan seputar proses pendaftaran murid DUBESIA.
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
                            Jika pertanyaanmu belum terjawab, silakan hubungi admin melalui kontak resmi DUBESIA yang tersedia.
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Informasi kontak admin perlu ditambahkan sesuai kontak resmi yang digunakan DUBESIA.
                        </p>
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
