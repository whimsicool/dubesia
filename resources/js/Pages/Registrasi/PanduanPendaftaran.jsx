import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function PanduanPendaftaran() {
    const steps = [
        {
            number: "01",
            title: "Buka Halaman Registrasi",
            description: "Masuk ke halaman registrasi DUBESIA untuk memulai proses pendaftaran sebagai murid."
        },
        {
            number: "02",
            title: "Lengkapi Formulir",
            description: "Isi data yang diminta pada formulir pendaftaran dengan lengkap dan sesuai keadaan sebenarnya."
        },
        {
            number: "03",
            title: "Periksa Data",
            description: "Pastikan data diri dan informasi lainnya sudah benar sebelum formulir dikirim."
        },
        {
            number: "04",
            title: "Kirim Pendaftaran",
            description: "Kirim formulir dan perhatikan pemberitahuan dari sistem untuk memastikan proses pengiriman berhasil."
        },
        {
            number: "05",
            title: "Tunggu Verifikasi Admin",
            description: "Admin akan memeriksa pendaftaran. Ikuti informasi dan arahan yang diberikan terkait hasil pemeriksaan."
        }
    ];

    return (
        <>
            <Head title="Panduan Pendaftaran" />

            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                            <img src="/images/dubesia-logo.png" alt="Logo DUBESIA" className="h-10 w-10 rounded-full object-contain" />
                            <div>
                                <p className="font-bold text-slate-900">DUBESIA</p>
                                <p className="text-xs text-slate-500">Panduan Pendaftaran</p>
                            </div>
                        </div>
                        <Link href={route('bantuan-admisi')} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                            Bantuan Admisi
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
                    <section className="rounded-3xl bg-gradient-to-r from-dubesia-red via-dubesia-red to-dubesia-navy px-6 py-10 text-white sm:px-10">
                        <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">Informasi Calon Murid</p>
                        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Panduan Pendaftaran</h1>
                        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                            Ikuti tahapan berikut untuk memahami proses pendaftaran murid di DUBESIA.
                        </p>
                    </section>

                    <section className="mt-10">
                        <h2 className="text-xl font-bold">Tahapan Pendaftaran</h2>
                        <div className="mt-6 space-y-4">
                            {steps.map((step) => (
                                <div key={step.number} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:gap-6 sm:p-6">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-dubesia-red font-bold text-white">
                                        {step.number}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{step.title}</h3>
                                        <p className="mt-2 leading-7 text-slate-600">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
                        <h2 className="font-bold text-slate-900">Hal yang perlu diperhatikan</h2>
                        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-slate-700">
                            <li>Gunakan data yang benar dan lengkap.</li>
                            <li>Periksa kembali data sebelum mengirim formulir.</li>
                            <li>Simpan informasi pendaftaran jika diperlukan.</li>
                            <li>Tunggu proses verifikasi dan ikuti arahan admin.</li>
                        </ul>
                    </section>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={route('registrasi.create')} className="rounded-lg bg-dubesia-red px-5 py-3 text-sm font-semibold text-white hover:bg-dubesia-navy">
                            Mulai Pendaftaran
                        </Link>
                        <Link href={route('bantuan-admisi')} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-100">
                            Butuh Bantuan?
                        </Link>
                    </div>
                </main>

                <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    © {new Date().getFullYear()} DUBESIA
                </footer>
            </div>
        </>
    );
}
