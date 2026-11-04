import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Input kata sandi dengan tombol intip yang sama di seluruh aplikasi.
 * Teruskan kelas input lewat inputClassName agar tampilan mengikuti halaman.
 */
const PasswordInput = forwardRef(function PasswordInput(
    { className = '', inputClassName = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500', style, isFocused = false, ...props },
    ref,
) {
    const inputRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className={`relative ${className}`}>
            <input
                {...props}
                ref={inputRef}
                type={visible ? 'text' : 'password'}
                className={inputClassName}
                style={{ ...style, paddingRight: '2.75rem' }}
            />

            <button
                type="button"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={visible}
                title={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:text-slate-900"
            >
                {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
        </div>
    );
});

export default PasswordInput;
