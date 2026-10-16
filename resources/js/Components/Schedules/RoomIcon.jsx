import { Building2, Monitor, Video } from 'lucide-react';

/** Ikon ruang berdasarkan tipe: online (Video), lab (Monitor), fisik (Building2). */
export default function RoomIcon({ type, className = 'h-3.5 w-3.5' }) {
    if (type === 'online') return <Video className={className} />;
    if (type === 'lab') return <Monitor className={className} />;
    return <Building2 className={className} />;
}
