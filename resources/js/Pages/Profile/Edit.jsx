import FlashBanner from '@/Components/Common/FlashBanner';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ImagePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

const ROLE_LABEL = { admin: 'Admin', tutor: 'Tutor', student: 'Murid' };

const STATUS_STYLE = {
    terverifikasi: 'bg-emerald-50 text-emerald-700',
    menunggu_verifikasi: 'bg-amber-50 text-amber-700',
    ditolak: 'bg-rose-50 text-rose-700',
};

const rupiah = (value) => `Rp ${Number(value ?? 0).toLocaleString('id-ID')}`;

const formatDate = (value) =>
    value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-';

const initials = (name) =>
    (name ?? '')
        .split(/\s+/)
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

function Avatar({ name, src, size = 'h-20 w-20' }) {
    if (src) {
        return <img src={src} alt={`Foto profil ${name}`} className={`${size} shrink-0 rounded-2xl object-cover`} />;
    }

    return (
        <span className={`${size} flex shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white`}>
            {initials(name)}
        </span>
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
        <form onSubmit={submit} className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            <p className="text-sm font-semibold text-slate-800">Foto profil</p>

            <label
                htmlFor="photo"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
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

            <p className="text-xs text-slate-500">
                {data.photo ? data.photo.name : 'JPG, PNG, atau WEBP. Maksimal 2 MB.'}
            </p>

            {preview && <img src={preview} alt="Pratinjau foto profil" className="h-24 w-24 rounded-2xl object-cover" />}

            <InputError message={errors.photo} />

            <button
                type="submit"
                disabled={processing || !data.photo}
                className="block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Simpan foto
            </button>

            {recentlySuccessful && <p className="text-sm text-emerald-700">Foto profil tersimpan.</p>}
        </form>
    );
}

export default function Edit({ profile, pendaftaran }) {
    const { flash } = usePage().props;

    return (
        <AdminLayout title="Profil">
            <Head title="Profil" />

            <FlashBanner flash={flash?.success} />

            <div className="grid gap-5 lg:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Avatar name={profile.name} src={profile.avatar_url} />
                        <div className="min-w-0">
                            <p className="truncate text-lg font-bold text-slate-950">{profile.name}</p>
                            <p className="text-sm font-semibold text-red-700">{ROLE_LABEL[profile.role] ?? profile.role}</p>
                            {profile.class_level && (
                                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                    Level {profile.class_level}
                                </span>
                            )}
                        </div>
                    </div>

                    {profile.can_upload_photo && <PhotoForm />}
                </section>

                <div className="space-y-5 lg:col-span-2">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
                            <h2 className="text-base font-bold text-slate-900">Data diri</h2>
                            <p className="text-xs text-slate-500">Hubungi admin bila ada data yang salah.</p>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <InfoRow label="Nama lengkap" value={profile.name} />
                            <InfoRow label="Email" value={profile.email} />
                            <InfoRow label="No. HP / WhatsApp" value={profile.no_hp} />
                            {profile.role === 'student' && (
                                <InfoRow label="Level kelas" value={profile.class_level || 'Belum ada hasil tes'} />
                            )}
                        </div>
                    </section>

                    {pendaftaran && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <h2 className="text-base font-bold text-slate-900">Data pendaftaran</h2>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[pendaftaran.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {pendaftaran.status_label}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <InfoRow label="Nama saat mendaftar" value={pendaftaran.nama_lengkap} />
                                <InfoRow label="Tanggal lahir" value={formatDate(pendaftaran.tanggal_lahir)} />
                                <InfoRow label="Asal institusi" value={pendaftaran.asal_institusi} />
                                <InfoRow label="Program" value={pendaftaran.program} />
                                <InfoRow label="Biaya pendaftaran" value={rupiah(pendaftaran.biaya)} />
                                <InfoRow label="Alamat" value={pendaftaran.alamat} />
                            </div>

                            {pendaftaran.catatan_verifikasi && (
                                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                                    <p className="font-bold">Catatan dari admin</p>
                                    <p className="mt-1 whitespace-pre-line leading-6">{pendaftaran.catatan_verifikasi}</p>
                                </div>
                            )}
                        </section>
                    )}

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">Ubah kata sandi</h2>
                        <div className="mt-4">
                            <UpdatePasswordForm />
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}
