import { Fragment } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import {
    ArrowRight,
    BookOpen,
    Briefcase,
    CalendarDays,
    Check,
    ClipboardCheck,
    Gauge,
    GraduationCap,
    Languages,
    MapPin,
    Mic,
} from 'lucide-react';

import HeroMark from '@/Components/Landing/HeroMark';
import LandingFooter from '@/Components/Landing/LandingFooter';
import LandingHeader from '@/Components/Landing/LandingHeader';
import Reveal from '@/Components/Landing/Reveal';
import {
    MOTION_EASE,
    fadeUp,
    wordStagger,
    wordUp,
} from '@/Components/Landing/motion';

const PROGRAM_ICONS = {
    diplomatic_speech: Mic,
    toefl_ielts: GraduationCap,
    executive_english: Briefcase,
    mandarin_hsk: Languages,
};

const HEADLINE = 'Bahasa yang siap dipakai di panggung internasional.';

const HERO_POINTS = [
    'Jadwal dan ruang kelas',
    'Materi per kelas',
    'Presensi, nilai, dan tes level',
];

const FEATURES = [
    {
        icon: CalendarDays,
        title: 'Jadwal belajar',
        description:
            'Lihat jadwal kelas mingguan beserta ruang dan jam pertemuannya.',
    },
    {
        icon: BookOpen,
        title: 'Materi kelas',
        description:
            'Buka dan pelajari materi yang dibagikan tutor untuk setiap kelas.',
    },
    {
        icon: ClipboardCheck,
        title: 'Presensi dan nilai',
        description: 'Pantau kehadiran dan nilai akhir setiap kelas.',
    },
    {
        icon: Gauge,
        title: 'Tes level',
        description:
            'Kenali tingkat kemampuan bahasa Anda sebelum masuk kelas.',
    },
];

const STEPS = [
    {
        title: 'Ajukan pendaftaran',
        description:
            'Isi formulir, pilih program, dan unggah bukti pembayaran pendaftaran.',
    },
    {
        title: 'Tunggu verifikasi',
        description:
            'Admin memeriksa data diri dan bukti pembayaran yang Anda kirim.',
    },
    {
        title: 'Terima akses portal',
        description:
            'Akun portal DUBESIA aktif dengan kata sandi sementara, lalu masuk dan ikuti tes level.',
    },
];

const ADDRESS =
    'Jl. Taman Karya, Tuah Karya, Tuah Madani, Kota Pekanbaru, Riau 28293';

const MAPS_URL =
    'https://www.google.com/maps/search/?api=1&query=Dubes+Communications+Pekanbaru';

const heroContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export default function Landing({ programs }) {
    const reduceMotion = useReducedMotion();

    return (
        <>
            <Head title="Kursus Bahasa Inggris di Pekanbaru">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="DUBES Communications, kursus bahasa Inggris di Pekanbaru sejak 2009: pidato diplomatik, TOEFL & IELTS, executive English, dan Mandarin HSK. Portal murid DUBESIA."
                />
            </Head>

            <div className="min-h-screen overflow-x-hidden bg-surface font-body-md text-body-md text-on-surface selection:bg-surface-variant selection:text-on-surface">
                <a
                    href="#konten"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary-container focus:px-4 focus:py-2 focus:font-label-lg focus:text-label-lg focus:text-white"
                >
                    Lewati ke konten
                </a>

                <LandingHeader />

                <main id="konten">
                    <section className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-surface-container-high/60 blur-3xl"
                        />
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-32 top-32 h-[26rem] w-[26rem] rounded-full bg-dubesia-gold/10 blur-3xl"
                        />

                        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12">
                            <motion.div
                                initial={reduceMotion ? false : 'hidden'}
                                animate="visible"
                                variants={heroContainer}
                                className="flex flex-col items-start gap-6"
                            >
                                <motion.p
                                    variants={fadeUp}
                                    className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5 shadow-sm"
                                >
                                    <MapPin className="h-3.5 w-3.5 text-secondary" />
                                    <span className="font-label-md text-label-md uppercase tracking-[0.14em] text-on-surface">
                                        Kursus bahasa Inggris di Pekanbaru
                                    </span>
                                </motion.p>

                                <motion.h1
                                    variants={wordStagger}
                                    className="text-balance font-display-lg text-display-lg-mobile text-on-surface sm:text-display-lg"
                                >
                                    {HEADLINE.split(' ').map(
                                        (word, index, words) => (
                                            <Fragment key={index}>
                                                <motion.span
                                                    variants={wordUp}
                                                    className="inline-block"
                                                >
                                                    {word}
                                                </motion.span>
                                                {index < words.length - 1
                                                    ? ' '
                                                    : null}
                                            </Fragment>
                                        ),
                                    )}
                                </motion.h1>

                                <motion.p
                                    variants={fadeUp}
                                    className="max-w-xl font-body-lg text-body-lg text-on-surface-variant"
                                >
                                    DUBES Communications membina pidato
                                    diplomatik, TOEFL &amp; IELTS, executive
                                    English, dan Mandarin HSK dalam kelas
                                    terstruktur sejak 2009. Portal DUBESIA
                                    menampilkan jadwal, materi, presensi, dan
                                    nilai Anda.
                                </motion.p>

                                <motion.div
                                    variants={fadeUp}
                                    className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
                                >
                                    <Link
                                        href={route('registrasi.create')}
                                        className="group flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 font-label-lg text-label-lg text-white shadow-[0_18px_35px_-20px_rgba(182,23,24,0.9)] transition-colors hover:bg-primary-container"
                                    >
                                        Daftar sebagai murid
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-3 text-center font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container"
                                    >
                                        Masuk ke portal
                                    </Link>
                                </motion.div>

                                <motion.ul
                                    variants={fadeUp}
                                    className="flex flex-wrap gap-x-6 gap-y-2 pt-2"
                                >
                                    {HERO_POINTS.map((point) => (
                                        <li
                                            key={point}
                                            className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant"
                                        >
                                            <Check className="h-4 w-4 text-dubesia-gold-dark" />
                                            {point}
                                        </li>
                                    ))}
                                </motion.ul>
                            </motion.div>

                            <motion.div
                                initial={
                                    reduceMotion
                                        ? false
                                        : { opacity: 0, scale: 0.96 }
                                }
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.1,
                                    ease: MOTION_EASE,
                                }}
                                className="relative"
                            >
                                <HeroMark />
                            </motion.div>
                        </div>
                    </section>

                    <section
                        id="program"
                        className="scroll-mt-24 border-t border-outline-variant/40 bg-surface-container-lowest py-16 sm:py-20"
                    >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
                            <Reveal className="max-w-2xl">
                                <p className="font-label-md text-label-md uppercase tracking-[0.18em] text-secondary">
                                    Program
                                </p>
                                <h2 className="mt-3 text-balance font-headline-lg text-headline-lg text-on-surface">
                                    Empat program, satu standar pembinaan.
                                </h2>
                            </Reveal>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {programs.map((program, index) => {
                                    const Icon =
                                        PROGRAM_ICONS[program.value] ??
                                        BookOpen;

                                    return (
                                        <Reveal
                                            key={program.value}
                                            as="article"
                                            delay={index * 0.07}
                                            hover
                                            className="flex h-full flex-col gap-3 rounded-2xl border border-outline-variant/50 bg-surface p-6 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(11,28,48,0.45)]"
                                        >
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-dubesia-gold/20 text-dubesia-gold-dark">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <h3 className="font-title-md text-title-md text-on-surface">
                                                {program.label}
                                            </h3>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                                                {program.deskripsi}
                                            </p>
                                        </Reveal>
                                    );
                                })}
                            </div>

                            <Reveal
                                delay={0.1}
                                className="mt-8 flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-on-surface-variant"
                            >
                                Belum yakin memilih program?
                                <Link
                                    href={route('panduan-pendaftaran')}
                                    className="font-label-lg text-label-lg text-secondary underline-offset-4 hover:underline"
                                >
                                    Baca panduan pendaftaran
                                </Link>
                            </Reveal>
                        </div>
                    </section>

                    <section
                        id="fitur"
                        className="scroll-mt-24 py-16 sm:py-20"
                    >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
                            <Reveal className="max-w-2xl">
                                <p className="font-label-md text-label-md uppercase tracking-[0.18em] text-secondary">
                                    Fitur
                                </p>
                                <h2 className="mt-3 text-balance font-headline-lg text-headline-lg text-on-surface">
                                    Seluruh proses belajar dalam satu portal.
                                </h2>
                            </Reveal>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                {FEATURES.map((feature, index) => {
                                    const Icon = feature.icon;

                                    return (
                                        <Reveal
                                            key={feature.title}
                                            as="article"
                                            delay={index * 0.07}
                                            hover
                                            className="flex gap-4 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-6"
                                        >
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div className="flex flex-col gap-1">
                                                <h3 className="font-title-md text-title-md text-on-surface">
                                                    {feature.title}
                                                </h3>
                                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section
                        id="pendaftaran"
                        className="scroll-mt-24 border-t border-outline-variant/40 bg-surface-container-lowest py-16 sm:py-20"
                    >
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
                            <Reveal className="max-w-2xl">
                                <p className="font-label-md text-label-md uppercase tracking-[0.18em] text-secondary">
                                    Pendaftaran
                                </p>
                                <h2 className="mt-3 text-balance font-headline-lg text-headline-lg text-on-surface">
                                    Tiga langkah sebelum kelas pertama.
                                </h2>
                            </Reveal>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                {STEPS.map((step, index) => (
                                    <Reveal
                                        key={step.title}
                                        as="article"
                                        delay={index * 0.08}
                                        hover
                                        className="flex flex-col gap-3 rounded-2xl border border-outline-variant/50 bg-surface p-6"
                                    >
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-label-lg text-label-lg text-white">
                                            {index + 1}
                                        </span>
                                        <h3 className="font-title-md text-title-md text-on-surface">
                                            {step.title}
                                        </h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                                            {step.description}
                                        </p>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="lokasi"
                        className="scroll-mt-24 py-16 sm:py-20"
                    >
                        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12">
                            <Reveal className="flex flex-col gap-4">
                                <p className="font-label-md text-label-md uppercase tracking-[0.18em] text-secondary">
                                    Lokasi
                                </p>
                                <h2 className="text-balance font-headline-lg text-headline-lg text-on-surface">
                                    Kelas berlangsung di Pekanbaru.
                                </h2>
                                <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
                                    DUBES Communications membuka kelas tatap
                                    muka di Tuah Madani. Bila Anda perlu arahan
                                    menuju lokasi, hubungi admin melalui halaman
                                    bantuan admisi.
                                </p>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <a
                                        href={MAPS_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-2.5 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container"
                                    >
                                        <MapPin className="h-4 w-4 text-secondary" />
                                        Buka di Google Maps
                                    </a>
                                    <Link
                                        href={route('bantuan-admisi')}
                                        className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:text-on-surface"
                                    >
                                        Bantuan admisi
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </Reveal>

                            <Reveal
                                delay={0.1}
                                className="relative overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container-lowest p-8 shadow-[0_20px_45px_-35px_rgba(11,28,48,0.5)] lg:max-w-md lg:justify-self-end"
                            >
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-dubesia-gold/15 blur-2xl"
                                />
                                <div className="relative flex flex-col gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                        <MapPin className="h-5 w-5" />
                                    </span>
                                    <p className="font-title-md text-title-md text-on-surface">
                                        DUBES Communications
                                    </p>
                                    <p className="font-body-md text-body-md text-on-surface-variant">
                                        {ADDRESS}
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    <div className="px-4 pb-16 sm:px-6 lg:px-12 lg:pb-20">
                        <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary-container px-6 py-12 sm:px-12 sm:py-16">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-dubesia-gold/20 blur-3xl"
                            />
                            <motion.div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                animate={
                                    reduceMotion
                                        ? undefined
                                        : { x: ['0%', '420%'] }
                                }
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                    ease: 'easeInOut',
                                }}
                            />

                            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-xl">
                                    <h2 className="text-balance font-headline-lg text-headline-lg text-white">
                                        Mulai kelas pertama Anda di DUBES
                                        Communications.
                                    </h2>
                                    <p className="mt-3 font-body-md text-body-md text-surface-container-high">
                                        Pendaftaran dibuka untuk calon murid
                                        baru. Lengkapi formulir, lalu tunggu
                                        verifikasi admin.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route('registrasi.create')}
                                        className="rounded-xl bg-white px-6 py-3 font-label-lg text-label-lg text-primary-container transition-colors hover:bg-dubesia-gold-soft"
                                    >
                                        Daftar sekarang
                                    </Link>
                                    <Link
                                        href={route('panduan-pendaftaran')}
                                        className="rounded-xl border border-white/25 px-6 py-3 font-label-lg text-label-lg text-white transition-colors hover:bg-white/10"
                                    >
                                        Lihat panduan
                                    </Link>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </main>

                <LandingFooter />
            </div>
        </>
    );
}
