import GmailInput from '@/Components/GmailInput';
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const [sent, setSent] = useState(Boolean(status));
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('password.email'), {
            onSuccess: () => { setSent(true); setData('email', ''); },
        });
    };

    return (
        <>
            <Head title="Lupa Kata Sandi">
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

            <div className="flex min-h-screen flex-col bg-surface font-body-md text-body-md text-on-surface selection:bg-surface-variant">
                <header className="fixed left-0 top-0 z-50 w-full bg-surface/90 shadow-[0_1px_8px_rgba(11,28,48,0.04)] backdrop-blur-xl">
                    <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-6 lg:px-12">
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

                <main className="flex flex-1 flex-col justify-center pt-20">
                    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                        <div className="relative flex w-full max-w-xl flex-col items-center">
                            <div className="w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_10px_25px_-5px_rgba(11,28,48,0.06),0_4px_10px_-2px_rgba(11,28,48,0.03)]">
                                <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-secondary to-primary-container"></div>

                                <div className="flex flex-col items-center p-6 sm:p-10">
                                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
                                        <span className="material-symbols-outlined text-3xl text-secondary">
                                            {sent ? 'mark_email_read' : 'lock_reset'}
                                        </span>
                                    </div>

                                    <div className="mb-6 max-w-md text-center">
                                        <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
                                            {sent ? 'Periksa Email Anda' : 'Lupa Kata Sandi'}
                                        </h1>
                                        <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
                                            {sent
                                                ? 'Jika email Anda terdaftar, kata sandi baru telah dikirim melalui email. Periksa kotak masuk dan folder spam, lalu silakan masuk kembali.'
                                                : 'Masukkan email akun Anda. Kami akan mengirim kata sandi baru ke email tersebut.'}
                                        </p>
                                    </div>

                                    {sent ? (
                                        <Link href={route('login')} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3 font-semibold text-white hover:bg-primary-container">
                                            <span className="material-symbols-outlined" aria-hidden="true">login</span>
                                            Masuk kembali
                                        </Link>
                                    ) : (
                                    <form
                                        className="flex w-full flex-col gap-5"
                                        onSubmit={submit}
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <label
                                                className="font-label-lg text-label-lg font-medium text-on-surface"
                                                htmlFor="email"
                                            >
                                                Email
                                            </label>

                                            <div className="relative flex items-center">
                                                <span className="material-symbols-outlined pointer-events-none absolute left-3.5 text-xl text-on-surface-variant">
                                                    badge
                                                </span>
                                                <GmailInput
                                                    className="h-11 w-full rounded-lg bg-surface-container-lowest pl-11 pr-4 font-body-md text-body-md text-on-surface shadow-sm transition-all placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary"
                                                    id="email"
                                                    name="email"
                                                    
                                                    autoComplete="username"
                                                    autoFocus
                                                    value={data.email}
                                                    onChange={(event) =>
                                                        setData(
                                                            'email',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="nama@email.com"
                                                    required
                                                />
                                            </div>

                                            {errors.email ? (
                                                <p className="font-body-sm text-body-sm font-medium text-error">
                                                    {errors.email}
                                                </p>
                                            ) : (
                                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                                    Gunakan email terdaftar yang sudah terverifikasi. Email calon murid
                                                    yang pendaftarannya belum selesai tidak dapat dipakai.
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            className="mt-2 flex h-12 w-full transform cursor-pointer items-center justify-center gap-2 rounded-lg bg-secondary font-label-lg text-label-lg font-semibold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                send
                                            </span>
                                            <span>
                                                {processing
                                                    ? 'Mengirim Kata Sandi...'
                                                    : 'Kirim Kata Sandi Baru'}
                                            </span>
                                        </button>
                                    </form>
                                    )}
                                </div>

                                
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
