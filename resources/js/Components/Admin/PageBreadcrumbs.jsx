import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

export default function PageBreadcrumbs({ items = [], className = '' }) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${className}`}
        >
            {items.map((item, index) => (
                <span key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 && <span aria-hidden="true">›</span>}
                    {item.route ? (
                        <Link
                            href={route(item.route, item.params ?? {})}
                            className={item.current ? 'text-red-700 hover:text-slate-900' : 'hover:text-slate-900'}
                        >
                            {item.label}
                            {!item.current && <ArrowUpRight aria-hidden="true" className="ml-1 inline h-3 w-3 opacity-70" />}
                        </Link>
                    ) : (
                        <span>{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
