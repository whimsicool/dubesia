import PageBreadcrumbs from '@/Components/Admin/PageBreadcrumbs';
import FlashBanner from '@/Components/Common/FlashBanner';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, Save, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

const ROLE_LABEL = { admin: 'Admin', tutor: 'Tutor', student: 'Murid' };

const DASHBOARD = {
    admin: { label: 'Dashboard Admin', route: 'admin.dashboard' },
    tutor: { label: 'Dashboard Tutor', route: 'tutor.dashboard' },
    student: { label: 'Dashboard Murid', route: 'dashboard' },
};

const STATUS_STYLE = {
    menunggu_pembayaran: 'bg-sky-50 text-sky-700',
    menunggu_verifikasi: 'bg-amber-50 text-amber-700',
    terverifikasi: 'bg-emerald-50 text-emerald-700',
    ditolak: 'bg-rose-50 text-rose-700',
};

const rupiah = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const formatDate = (value) =>
    value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-';

const initials = (name) =>
    (name ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value || '-'}</p>
        </div>
    );
}

function PhotoForm() {
    const [preview, setPreview] = useState(null);
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({ photo: null });

    useEffect(() => {
        if (!preview) return undefined;

        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    const choosePhoto = (event) => {
        const file = event.target.files?.[0] ?? null;
        setData('photo', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('profile.photo.update'), { forceFormData: true, preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="mt-4">
            <div className="flex flex-wrap items-center gap-3">
                <label
                    htmlFor="photo"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                    <ImagePlus className="h-4 w-4" />
                    Pilih foto
                </label>
                <input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={choosePhoto}
                    className="sr-only"
                />
                <button
                    type="submit"
                    disabled={processing || !data.photo}
                    className="shrink-0 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" />Simpan foto</span>
                </button>
            </div>

            <p className="mt-2 truncate text-xs text-slate-500" title={data.photo?.name}>
                {data.photo ? data.photo.name : 'JPG, PNG, atau WEBP. Maksimal 2 MB.'}
            </p>

            {preview && <img src={preview} alt="Pratinjau foto profil" className="mt-3 h-20 w-20 rounded-2xl object-cover" />}

            <InputError message={errors.photo} className="mt-2" />

            {recentlySuccessful && <p className="mt-2 text-sm text-emerald-700">Foto profil tersimpan.</p>}
        </form>
    );
}

export default function Edit({ profile, pendaftaran }) {
    const { flash } = usePage().props;
    const dashboard = DASHBOARD[profile.role] ?? DASHBOARD.student;

    return (
        <AdminLayout>
            <Head title="Profil" />

            <FlashBanner flash={flash?.success} />

            <div className="mb-6">
                <PageBreadcrumbs
                    className="mb-2"
                    items={[
                        { label: dashboard.label, route: dashboard.route },
                        { label: 'Profil', route: 'profile.edit', current: true },
                    ]}
                />

                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Profil</h1>
                <p className="mt-1 text-sm text-slate-600">Kelola foto, data akun, dan kata sandi Anda.</p>
            </div>

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dubesia-red via-dubesia-red to-dubesia-navy px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                    {profile.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={`Foto profil ${profile.name}`}
                            className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-white/25"
                        />
                    ) : (
                        <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold text-white ring-4 ring-white/15">
                            {initials(profile.name)}
                        </span>
                    )}

                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                            Akun {ROLE_LABEL[profile.role] ?? profile.role}
                        </p>
                        <h2 className="mt-1 truncate text-2xl font-extrabold sm:text-3xl">{profile.name}</h2>
                        <p className="mt-1 break-all text-sm text-white/85">{profile.email}</p>

                        {(profile.class_level || pendaftaran?.status_label) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {profile.class_level && (
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                                        Level {profile.class_level}
                                    </span>
                                )}
                                {pendaftaran?.status_label && (
                                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                                        {pendaftaran.status_label}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="mt-5 grid items-start gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-7">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
                            <h2 className="text-base font-bold text-slate-900">Data diri</h2>
                            <p className="text-xs text-slate-500">Hubungi admin bila ada data yang salah.</p>
                        </div>

                        <div className="mt-4 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                            <InfoRow label="Nama lengkap" value={profile.name} />
                            <InfoRow label="No. HP / WhatsApp" value={profile.no_hp} />
                            <InfoRow label="Email" value={profile.email} />
                            {profile.role === 'student' && (
                                <InfoRow label="Level kelas" value={profile.class_level || 'Belum ada hasil tes'} />
                            )}
                        </div>

                        {pendaftaran && (
                            <>
                                <div className="my-5 border-t border-slate-100" />

                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold text-slate-900">Informasi pendaftaran</h3>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[pendaftaran.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                        {pendaftaran.status_label}
                                    </span>
                                </div>

                                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                                    <InfoRow label="Tanggal lahir" value={formatDate(pendaftaran.tanggal_lahir)} />
                                    <InfoRow label="Asal institusi" value={pendaftaran.asal_institusi} />
                                    <InfoRow label="Program" value={pendaftaran.program} />
                                    <InfoRow label="Biaya pendaftaran" value={rupiah(pendaftaran.biaya)} />
                                    <div className="sm:col-span-2">
                                        <InfoRow label="Alamat" value={pendaftaran.alamat} />
                                    </div>
                                </div>

                                {pendaftaran.status === 'menunggu_pembayaran' && (
                                    <a
                                        href={route('pembayaran.show')}
                                        className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                                    >
                                        <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" />Lanjutkan Pembayaran</span>
                                    </a>
                                )}

                                {pendaftaran.catatan_verifikasi && (
                                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                                        <p className="font-bold">Catatan dari admin</p>
                                        <p className="mt-1 whitespace-pre-line leading-6">{pendaftaran.catatan_verifikasi}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>

                <div className="space-y-5 xl:col-span-5">
                    {profile.can_upload_photo && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">Foto profil</h2>
                            <PhotoForm />
                        </section>
                    )}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">Kata sandi</h2>
                        <div className="mt-5">
                            <UpdatePasswordForm />
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
