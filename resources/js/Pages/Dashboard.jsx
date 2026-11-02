import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import ActionPanel from '@/Components/Dashboard/ActionPanel';
import ActivityChart from '@/Components/Dashboard/ActivityChart';
import StatTile from '@/Components/Dashboard/StatTile';
import WeekAgenda from '@/Components/Dashboard/WeekAgenda';

const TITLE = { admin: 'Dashboard Admin', tutor: 'Dashboard Tutor', student: 'Dashboard Murid' };

/** Dashboard universal: satu halaman, isi mengikuti role dari server. */
export default function Dashboard({ dashboard }) {
    return (
        <AdminLayout title={TITLE[dashboard.role] ?? 'Dashboard'}>
            <Head title="Dashboard" />

            <div className="space-y-5">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {dashboard.stats.map((stat) => (
                        <StatTile key={stat.key} stat={stat} />
                    ))}
                </section>

                <div className="grid gap-5 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <ActivityChart chart={dashboard.chart} />
                    </div>
                    <ActionPanel panel={dashboard.panel} />
                    <WeekAgenda agenda={dashboard.agenda} className="xl:col-span-3" />
                </div>
            </div>
        </AdminLayout>
    );
}
