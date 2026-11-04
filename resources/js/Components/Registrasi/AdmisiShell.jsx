import { Head, Link } from '@inertiajs/react';

export default function AdmisiShell({ title, description, children, showLogout = false }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Head title={`${title} | DUBESIA`}>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3" aria-label="DUBESIA">
            <img
              src="/images/dubesia-logo.png"
              alt="Logo DUBESIA"
              className="h-11 w-11 shrink-0 rounded-full object-contain"
            />

            <span className="min-w-0 leading-tight">
              <span className="block text-lg font-extrabold tracking-tight text-slate-900">DUBESIA</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Duta Bahasa Edukasi
              </span>
            </span>
          </div>

          <nav className="flex items-center gap-2 text-sm sm:gap-5">
            <Link href={route('bantuan-admisi')} className="hidden text-slate-600 transition hover:text-dubesia-red md:inline">
              Bantuan Admisi
            </Link>

            <Link href={route('panduan-pendaftaran')} className="hidden text-slate-600 transition hover:text-dubesia-red md:inline">
              Panduan Pendaftaran
            </Link>

            {showLogout ? (
              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="rounded-lg bg-dubesia-red-soft px-3 py-2 text-center text-xs font-semibold text-dubesia-red transition hover:bg-dubesia-red/10 sm:px-4 sm:text-sm"
              >
                Keluar
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-dubesia-red-soft px-3 py-2 text-center text-xs font-semibold text-dubesia-red transition hover:bg-dubesia-red/10 sm:px-4 sm:text-sm"
              >
                Masuk
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        {description && <p className="sr-only">{description}</p>}
        {children}
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-extrabold text-slate-900">
              DUBESIA
              <span className="ml-2 border-l border-slate-300 pl-2 text-xs font-medium text-slate-500">
                Portal Admisi Calon Murid
              </span>
            </p>

            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
              Pusat Pelatihan dan Penguasaan Bahasa Internasional, Etiket
              Diplomatik, dan Retorika Semesta.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <Link href={route('panduan-pendaftaran')} className="hover:text-dubesia-red">
              Panduan Pendaftaran
            </Link>

            <Link href={route('bantuan-admisi')} className="hover:text-dubesia-red">
              Bantuan Admisi
            </Link>
          </div>
        </div>

        <div className="bg-slate-100 px-4 py-3 text-center text-xs leading-5 text-slate-500">
          © {new Date().getFullYear()} DUBESIA (Duta Bahasa Edukasi Semesta).
          Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
}
