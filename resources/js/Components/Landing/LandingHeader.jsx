import { Link } from '@inertiajs/react';
import { BookOpen, CircleHelp, LogIn, MapPin, UserRoundPlus } from 'lucide-react';

import PublicHeader from '@/Components/PublicHeader';

const NAV_LINKS = [
    { href: '#program', label: 'Program', icon: BookOpen },
    { href: '#fitur', label: 'Fitur', icon: CircleHelp },
    { href: '#lokasi', label: 'Lokasi', icon: MapPin },
];

export default function LandingHeader() {
    return (
        <PublicHeader
            fixed
            links={NAV_LINKS}
            action={
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
            }
        />
    );
}
