import { forwardRef } from 'react';

/** Input email biasa. Tidak ada domain yang dipaksakan; pengguna mengetik alamat penuh. */
export default forwardRef(function GmailInput({ value = '', onChange, className = '', ...props }, ref) {
    return (
        <input
            {...props}
            ref={ref}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={value}
            onChange={onChange}
            placeholder={props.placeholder ?? 'nama@email.com'}
            className={className}
        />
    );
});
