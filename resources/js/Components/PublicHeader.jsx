import { Link } from '@inertiajs/react';

/**
 * Navbar publik yang dipakai semua halaman luar (landing, masuk, pendaftaran,
 * panduan, FAQ). Tinggi, padding, logo, dan gaya tautan sengaja disatukan agar
 * perpindahan antar halaman tidak terasa janggal.
 */
export default function PublicHeader({ links = [], action = null, fixed = false }) {
    const position = fixed ? 'fixed inset-x-0 top-0' : 'sticky top-0';

    return (
        <header className={`${position} z-50 border-b border-outline-variant/50 bg-surface/90 backdrop-blur-xl print:hidden`}>
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-12">
                <Link
                    href={route('landing')}
                    className="flex shrink-0 items-center gap-3"
                    aria-label="DUBESIA, kembali ke beranda"
                >
                    <img
                        src="/images/dubesia-logo.png"
                        alt=""
                        className="h-10 w-10 rounded-full object-contain"
                    />
                    <span className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-on-surface">
                        DUBESIA
                    </span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                    {links.length > 0 && (
                        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi halaman">
                            {links.map((link) =>
                                link.href?.startsWith('#') ? (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                                    >
                                        {link.icon && <link.icon aria-hidden="true" className="h-4 w-4" />}
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                                    >
                                        {link.icon && <link.icon aria-hidden="true" className="h-4 w-4" />}
                                        {link.label}
                                    </Link>
                                ),
                            )}
                        </nav>
                    )}

                    {action}
                </div>
            </div>
        </header>
    );
}
