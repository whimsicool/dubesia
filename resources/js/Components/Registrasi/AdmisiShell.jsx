import { Head, Link } from '@inertiajs/react';
import { BookOpen, CircleHelp, LogIn, LogOut } from 'lucide-react';

import PublicHeader from '@/Components/PublicHeader';

export default function AdmisiShell({ title, showLogout = false, children }) {
  const action = showLogout ? (
    <Link
      href={route('logout')}
      method="post"
      as="button"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-700 transition hover:bg-rose-100 sm:px-4 sm:text-sm"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      Keluar
    </Link>
  ) : (
    <Link
      href={route('login')}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-700 transition hover:bg-rose-100 sm:px-4 sm:text-sm"
    >
      <LogIn aria-hidden="true" className="h-4 w-4" />
      Masuk
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Head title={title}>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <PublicHeader
        links={[
          { label: 'Panduan Pendaftaran', href: route('panduan-pendaftaran'), icon: BookOpen },
          { label: 'FAQ', href: route('bantuan-admisi'), icon: CircleHelp },
        ]}
        action={action}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">{children}</main>

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
            <Link href={route('panduan-pendaftaran')} className="inline-flex items-center gap-2 hover:text-dubesia-red">
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              Panduan Pendaftaran
            </Link>

            <Link href={route('bantuan-admisi')} className="inline-flex items-center gap-2 hover:text-dubesia-red">
              <CircleHelp aria-hidden="true" className="h-4 w-4" />
              FAQ
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
