import { Building2, Video } from 'lucide-react';

/** Ikon ruang berdasarkan tipe: online (Video) atau ruang kelas (Building2). */
export default function RoomIcon({ type, className = 'h-3.5 w-3.5' }) {
    if (type === 'online') return <Video className={className} />;
    return <Building2 className={className} />;
}
