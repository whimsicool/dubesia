import { useEffect, useState } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Memeriksa email ke database saat pengguna berhenti mengetik.
 * Status: idle, checking, available, taken.
 */
export default function useEmailAvailability(email, ignoreUserId = null) {
    const [state, setState] = useState({ status: 'idle', message: '', bisaLanjut: false });

    useEffect(() => {
        const value = String(email ?? '').trim();

        if (!EMAIL_PATTERN.test(value)) {
            setState({ status: 'idle', message: '', bisaLanjut: false });
            return;
        }

        const controller = new AbortController();
        setState({ status: 'checking', message: '', bisaLanjut: false });

        const timer = window.setTimeout(async () => {
            const params = new URLSearchParams({ email: value });
            if (ignoreUserId) {
                params.set('abaikan', String(ignoreUserId));
            }

            try {
                const response = await fetch(`${route('email.cek')}?${params}`, {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Pemeriksaan email gagal.');
                }

                const payload = await response.json();

                setState({
                    status: payload.tersedia ? 'available' : 'taken',
                    message: payload.pesan ?? '',
                    bisaLanjut: Boolean(payload.bisa_lanjut),
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    // Jaringan bermasalah bukan alasan memblokir pengiriman;
                    // validasi server tetap menolak email ganda.
                    setState({ status: 'idle', message: '', bisaLanjut: false });
                }
            }
        }, 400);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [email, ignoreUserId]);

    return state;
}
