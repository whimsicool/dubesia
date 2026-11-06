import PageBreadcrumbs from '@/Components/Admin/PageBreadcrumbs';

/**
 * Kepala halaman admin: breadcrumb, judul, deskripsi, dan tombol aksi.
 * `breadcrumbs` = [{ label, route? }]; butir terakhir tampil sebagai halaman aktif.
 */
export default function PageHeader({ breadcrumbs = [], title, description, actions }) {
    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
                <PageBreadcrumbs items={breadcrumbs} />

                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
                {description && <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>}
            </div>

            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
    );
}
