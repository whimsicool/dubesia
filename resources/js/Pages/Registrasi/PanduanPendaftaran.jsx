import { Link } from '@inertiajs/react';
import { CircleHelp, UserRoundPlus } from 'lucide-react';

import AdmisiShell from '@/Components/Registrasi/AdmisiShell';

export default function PanduanPendaftaran() {
    const steps = [
        {
            number: '01',
            title: 'Buka Halaman Pendaftaran',
            description:
                'Masuk ke halaman pendaftaran DUBESIA untuk memulai proses pendaftaran sebagai murid.',
        },
        {
            number: '02',
            title: 'Lengkapi Formulir',
            description:
                'Isi data yang diminta pada formulir pendaftaran dengan lengkap dan sesuai keadaan sebenarnya.',
        },
        {
            number: '03',
            title: 'Periksa Data',
            description:
                'Pastikan data diri, alamat email, nomor WhatsApp, program, dan jenis kelas yang dipilih sudah benar sebelum formulir dikirim.',
        },
        {
            number: '04',
            title: 'Lakukan Pembayaran',
            description:
                'Setelah formulir dikirim, lanjut ke halaman pembayaran. Transfer sesuai biaya jenis kelas, lalu unggah bukti pembayaran pada halaman yang sama.',
        },
        {
            number: '05',
            title: 'Tunggu Verifikasi Admin',
            description:
                'Admin memeriksa data dan bukti pembayaran. Hasil verifikasi dikirim ke email yang kamu daftarkan. Cek kotak masuk dan folder spam secara berkala.',
        },
    ];

    return (
        <AdmisiShell title="Panduan Pendaftaran">
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
                    <li>Gunakan email aktif. Hasil verifikasi admin dikirim ke alamat email yang kamu daftarkan.</li>
                    <li>Periksa kotak masuk dan folder spam jika email verifikasi belum terlihat.</li>
                    <li>Pastikan nominal transfer sesuai biaya jenis kelas yang dipilih.</li>
                    <li>Pendaftaran baru diproses setelah bukti pembayaran diunggah.</li>
                </ul>
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
                <Link href={route('registrasi.create')} className="inline-flex items-center gap-2 rounded-lg bg-dubesia-red px-5 py-3 text-sm font-semibold text-white hover:bg-dubesia-navy">
                    <UserRoundPlus aria-hidden="true" className="h-4 w-4" />
                    Mulai Pendaftaran
                </Link>
                <Link href={route('bantuan-admisi')} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-100">
                    <CircleHelp aria-hidden="true" className="h-4 w-4" />
                    Butuh Bantuan?
                </Link>
            </div>
        </AdmisiShell>
    );
}
