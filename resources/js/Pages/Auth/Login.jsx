import { Head, Link, useForm } from '@inertiajs/react';
import PasswordInput from '@/Components/PasswordInput';
import { KeyRound } from 'lucide-react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-surface font-body-md text-body-md text-on-surface selection:bg-surface-variant selection:text-on-surface">
                <header className="fixed left-0 top-0 z-50 w-full bg-surface/90 shadow-[0_1px_8px_rgba(11,28,48,0.04)] backdrop-blur-xl">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:px-12">
                        <Link href="/" className="group flex items-center gap-3">
                            <img
                                src="/images/dubesia-logo.png"
                                alt="Logo DUBESIA"
                                className="h-10 w-10 rounded-full object-contain"
                            />
                            <span className="flex flex-col">
                                <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
                                    DUBESIA
                                </span>
                                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                                    Portal Masuk Murid &amp; Tutor
                                </span>
                            </span>
                        </Link>
                    </div>
                </header>

                <main className="flex w-full flex-1 flex-col justify-center bg-surface pt-20">
                    <div className="flex w-full flex-col">
                        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                            {/* Ambient Aesthetic Backdrops */}
                            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-surface-container-high/40 blur-3xl"></div>
                            <div className="pointer-events-none absolute -bottom-36 -right-32 h-[30rem] w-[30rem] rounded-full bg-surface-variant/30 blur-3xl"></div>

                            {/* Main Form Architecture */}
                            <div className="relative flex w-full max-w-xl flex-col items-center">
                                {/* Institutional Motto Accent Line */}
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5 shadow-sm">
                                    <span className="material-symbols-outlined text-base text-secondary">
                                        school
                                    </span>
                                    <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">
                                        Portal Pembelajaran &amp; Akses Kelas
                                    </span>
                                </div>

                                {/* Core Auth Card Container */}
                                <div className="w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_10px_25px_-5px_rgba(11,28,48,0.06),0_4px_10px_-2px_rgba(11,28,48,0.03)]">
                                    {/* Institutional Top Color Trim (Crimson & Navy gradient stripe) */}
                                    <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-secondary to-primary-container"></div>
                                    <div className="flex flex-col items-center p-6 sm:p-10">
                                        {/* DUBESIA Emblem Image Showcase */}
                                        <div className="group relative mb-5">
                                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surface-container-lowest p-1 shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-28">
                                                <img
                                                    alt="Emblem Lambang Duta Bahasa Edukasi Semesta (DUBESIA)"
                                                    className="h-full w-full object-contain"
                                                    src="/images/dubesia-logo.png"
                                                />
                                            </div>
                                        </div>

                                        {/* Academic Headline */}
                                        <div className="mb-6 max-w-md text-center">
                                            <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                                                Masuk ke Akun Belajar DUBESIA
                                            </h1>
                                            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                                                Silakan masukkan kredensial
                                                akun terdaftar Anda untuk
                                                mengakses jadwal, materi
                                                diplomasi, dan presensi.
                                            </p>
                                        </div>

                                        {status && (
                                            <div className="mb-6 w-full rounded-lg bg-surface-container px-3.5 py-3 font-body-sm text-body-sm font-medium text-on-surface">
                                                {status}
                                            </div>
                                        )}

                                        {/* Formal Authentication Form */}
                                        <form
                                            className="flex w-full flex-col gap-5"
                                            onSubmit={submit}
                                        >
                                            {/* Field 1: Email */}
                                            <div className="flex flex-col gap-1.5">
                                                <label
                                                    className="flex items-center justify-between font-label-lg text-label-lg font-medium text-on-surface"
                                                    htmlFor="email"
                                                >
                                                    <span>Email</span>
                                                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                                                        Wajib diisi
                                                    </span>
                                                </label>
                                                <div className="relative flex items-center">
                                                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-xl text-on-surface-variant">
                                                        badge
                                                    </span>
                                                    <input
                                                        className="h-11 w-full rounded-lg bg-surface-container-lowest pl-11 pr-4 font-body-md text-body-md text-on-surface shadow-sm transition-all placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary"
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        autoComplete="username"
                                                        autoFocus
                                                        value={data.email}
                                                        onChange={(e) =>
                                                            setData(
                                                                'email',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="cth. email@student.dubes.ac.id"
                                                        required
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="font-body-sm text-body-sm font-medium text-error">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Field 2: Password */}
                                            <div className="flex flex-col gap-1.5">
                                                <label
                                                    className="flex items-center justify-between font-label-lg text-label-lg font-medium text-on-surface"
                                                    htmlFor="password"
                                                >
                                                    <span>
                                                        Kata Sandi (Password)
                                                    </span>
                                                    <Link
                                                        href={route('password.request')}
                                                        className="inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary hover:underline"
                                                    >
                                                        <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                                                        Lupa kata sandi?
                                                    </Link>
                                                </label>
                                                <div className="relative flex items-center">
                                                    <span className="material-symbols-outlined pointer-events-none absolute left-3.5 z-10 text-xl text-on-surface-variant">
                                                        lock
                                                    </span>
                                                    <PasswordInput
                                                        className="w-full"
                                                        inputClassName="h-11 w-full rounded-lg bg-surface-container-lowest pl-11 font-body-md text-body-md text-on-surface shadow-sm transition-all placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary"
                                                        id="password"
                                                        name="password"
                                                        autoComplete="current-password"
                                                        value={data.password}
                                                        onChange={(e) =>
                                                            setData(
                                                                'password',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Masukkan kata sandi akun"
                                                        required
                                                    />
                                                </div>
                                                {errors.password && (
                                                    <p className="font-body-sm text-body-sm font-medium text-error">
                                                        {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Primary Action Button */}
                                            <button
                                                className="mt-2 flex h-12 w-full transform cursor-pointer items-center justify-center gap-2 rounded-lg bg-secondary font-label-lg text-label-lg font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <span className="material-symbols-outlined text-lg">
                                                    login
                                                </span>
                                                <span>
                                                    {processing
                                                        ? 'Memvalidasi Kredensial...'
                                                        : 'Masuk'}
                                                </span>
                                            </button>
                                        </form>
                                    </div>

                                    {/* Registration Invitation Footer Band */}
                                    <div className="flex w-full flex-col items-center justify-between gap-3 bg-surface-container-low px-6 py-4 text-center sm:flex-row sm:px-10 sm:text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base text-on-surface-variant">
                                                how_to_reg
                                            </span>
                                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                                                Belum memiliki akun murid
                                                aktif?
                                            </span>
                                        </div>
                                        <Link
                                            href={route('registrasi.create')}
                                            className="inline-flex items-center gap-1 font-label-lg text-label-lg font-bold text-secondary hover:underline"
                                        >
                                            <span>
                                                Daftar Akun Baru Sekarang
                                            </span>
                                            <span className="material-symbols-outlined text-base">
                                                chevron_right
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="w-full bg-surface-container-low py-8 shadow-[0_-1px_6px_rgba(11,28,48,0.03)]">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 lg:px-12 md:flex-row">
                        <div className="flex flex-col items-center gap-1 md:items-start">
                            <p className="text-center font-label-md text-label-md text-on-surface-variant md:text-left">
                                © 2025 DUBESIA (Duta Bahasa Edukasi Semesta).
                                Hak Cipta Dilindungi Undang-Undang.
                            </p>
                            <p className="text-center font-body-sm text-body-sm text-on-surface-variant md:text-left">
                                Terakreditasi Lembaga Standardisasi Bahasa &amp;
                                Pendidikan Karakter Internasional.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-full bg-surface-container-lowest px-3 py-1.5 text-on-surface-variant shadow-[0_1px_2px_rgba(11,28,48,0.04)]">
                            <span className="material-symbols-outlined text-base">
                                verified_user
                            </span>
                            <span className="font-label-sm text-label-sm font-medium">
                                Enkripsi SSL 256-bit
                            </span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
