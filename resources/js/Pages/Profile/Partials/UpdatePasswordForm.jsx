import InputError from '@/Components/InputError';
import PasswordInput from '@/Components/PasswordInput';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { Save } from 'lucide-react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (event) => {
        event.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (formErrors) => {
                if (formErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (formErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const inputClass =
        'mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-red-700 focus:ring-2 focus:ring-red-100';

    return (
        <form onSubmit={updatePassword} className="space-y-4">
            <div>
                <label htmlFor="current_password" className="text-sm font-semibold text-slate-800">
                    Kata sandi saat ini
                </label>
                <PasswordInput
                    id="current_password"
                    ref={currentPasswordInput}
                    value={data.current_password}
                    onChange={(event) => setData('current_password', event.target.value)}
                    autoComplete="current-password"
                    inputClassName={inputClass}
                />
                <InputError message={errors.current_password} className="mt-2" />
            </div>

            <div>
                <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                    Kata sandi baru
                </label>
                <PasswordInput
                    id="password"
                    ref={passwordInput}
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    autoComplete="new-password"
                    inputClassName={inputClass}
                />
                <InputError message={errors.password} className="mt-2" />
            </div>

            <div>
                <label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-800">
                    Ulangi kata sandi baru
                </label>
                <PasswordInput
                    id="password_confirmation"
                    value={data.password_confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                    autoComplete="new-password"
                    inputClassName={inputClass}
                />
                <InputError message={errors.password_confirmation} className="mt-2" />
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" />Simpan kata sandi</span>
                </button>

                {recentlySuccessful && <p className="text-sm text-emerald-700">Kata sandi diperbarui.</p>}
            </div>
        </form>
    );
}
