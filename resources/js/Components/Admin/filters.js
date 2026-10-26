import { router } from '@inertiajs/react';

/** Kunjungi ulang halaman daftar dengan filter baru tanpa kehilangan state tabel. */
export function visitFilters(routeName, params) {
    const clean = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );

    router.get(route(routeName), clean, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
}
