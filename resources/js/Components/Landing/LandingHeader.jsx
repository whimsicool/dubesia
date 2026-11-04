import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, CircleHelp, LogIn, MapPin, UserRoundPlus } from 'lucide-react';

import { MOTION_DURATION, MOTION_EASE } from './motion';

const NAV_LINKS = [
    { href: '#program', label: 'Program', icon: BookOpen },
    { href: '#fitur', label: 'Fitur', icon: CircleHelp },
    { href: '#lokasi', label: 'Lokasi', icon: MapPin },
];

export default function LandingHeader() {
    const reduceMotion = useReducedMotion();

    return (
        <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
            className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/50 bg-surface/85 backdrop-blur-xl"
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-12">
                <Link
                    href={route('landing')}
                    className="flex shrink-0 items-center gap-3"
                    aria-label="DUBES Communications, kembali ke beranda"
                >
                    <img
                        src="/images/dubesia-logo.png"
                        alt=""
                        className="h-10 w-10 rounded-full object-contain"
                    />
                    <span className="font-title-sm text-title-sm tracking-tight text-on-surface sm:font-headline-sm sm:text-headline-sm">
                        <span className="sm:hidden">DUBES</span>
                        <span className="hidden sm:inline">
                            DUBES Communications
                        </span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="inline-flex items-center gap-2 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                            <link.icon aria-hidden="true" className="h-4 w-4" />
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-label-lg text-label-lg text-on-surface transition-colors hover:bg-surface-container sm:px-4"
                    >
                        <LogIn aria-hidden="true" className="h-4 w-4" />
                        Masuk
                    </Link>
                    <Link
                        href={route('registrasi.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 font-label-lg text-label-lg text-white shadow-sm transition-colors hover:bg-primary-container"
                    >
                        <UserRoundPlus aria-hidden="true" className="h-4 w-4" />
                        Daftar
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}
