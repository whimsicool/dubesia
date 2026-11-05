import { Link } from '@inertiajs/react';
import { CircleHelp, ClipboardList, LogIn, MapPin, UserPlus } from 'lucide-react';

const PORTAL_LINKS = [
    { label: 'Masuk', route: 'login', icon: LogIn },
    { label: 'Daftar sebagai murid', route: 'registrasi.create', icon: UserPlus },
];

const INFO_LINKS = [
    { label: 'Panduan Pendaftaran', route: 'panduan-pendaftaran', icon: ClipboardList },
    { label: 'FAQ', route: 'bantuan-admisi', icon: CircleHelp },
];

const MAPS_URL =
    'https://www.google.com/maps/search/?api=1&query=Dubes+Communications+Pekanbaru';

function FooterLink({ link }) {
    const Icon = link.icon;

    return (
        <Link
            href={route(link.route)}
            className="inline-flex items-center gap-2 font-body-sm text-body-sm text-on-surface transition-colors hover:text-secondary"
        >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {link.label}
        </Link>
    );
}

export default function LandingFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-outline-variant/50 bg-surface">
            <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:justify-between lg:px-12">
                <div className="flex max-w-sm flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <img
                            src="/images/dubesia-logo.png"
                            alt="Lambang DUBES Communications"
                            className="h-11 w-11 rounded-full object-contain"
                        />
                        <div className="flex flex-col gap-1">
                            <span className="font-title-md text-title-md text-on-surface">
                                DUBES Communications
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Duta Bahasa Edukasi Semesta
                            </span>
                        </div>
                    </div>

                    <a
                        href={MAPS_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-secondary"
                    >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                        Jl. Taman Karya, Tuah Karya, Tuah Madani, Kota
                        Pekanbaru, Riau 28293
                    </a>
                </div>

                <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
                    <nav className="flex flex-col gap-3">
                        <span className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant">
                            Portal DUBESIA
                        </span>
                        {PORTAL_LINKS.map((link) => (
                            <FooterLink key={link.route} link={link} />
                        ))}
                    </nav>

                    <nav className="flex flex-col gap-3">
                        <span className="font-label-md text-label-md uppercase tracking-[0.18em] text-on-surface-variant">
                            Informasi
                        </span>
                        {INFO_LINKS.map((link) => (
                            <FooterLink key={link.route} link={link} />
                        ))}
                    </nav>
                </div>
            </div>

            <div className="border-t border-outline-variant/40">
                <p className="mx-auto max-w-7xl px-4 py-6 font-label-sm text-label-sm text-on-surface-variant sm:px-6 lg:px-12">
                    © {year} DUBES Communications. Portal DUBESIA.
                </p>
            </div>
        </footer>
    );
}
