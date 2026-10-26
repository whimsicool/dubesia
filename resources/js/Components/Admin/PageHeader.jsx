import { Link } from '@inertiajs/react';

/**
 * Kepala halaman admin: breadcrumb, judul, deskripsi, dan tombol aksi.
 * `breadcrumbs` = [{ label, route? }]; butir terakhir tampil sebagai halaman aktif.
 */
export default function PageHeader({ breadcrumbs = [], title, description, actions }) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
                <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;

                        return (
                            <span key={crumb.label} className="flex items-center gap-2">
                                {index > 0 && <span aria-hidden="true">›</span>}
                                {crumb.route && !isLast ? (
                                    <Link href={route(crumb.route)} className="hover:text-slate-900">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className={isLast ? 'text-red-700' : undefined}>{crumb.label}</span>
                                )}
                            </span>
                        );
                    })}
                </nav>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>}
            </div>

            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
    );
}
