import { forwardRef } from 'react';

export default forwardRef(function GmailInput({ value = '', onChange, className = '', style, ...props }, ref) {
    const name = String(value).split('@')[0];

    return (
        <div className="relative w-full min-w-0">
            <input
                {...props}
                ref={ref}
                type="text"
                inputMode="email"
                value={name}
                onChange={(event) => {
                    const local = event.target.value.split('@')[0].replace(/\s/g, '');
                    onChange?.({ ...event, target: { ...event.target, name: props.name, value: local ? local + '@gmail.com' : '' } });
                }}
                placeholder="namaemail"
                className={className}
                style={{ ...style, width: '100%', paddingRight: '7rem' }}
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-lg border-l border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-600">@gmail.com</span>
        </div>
    );
});
