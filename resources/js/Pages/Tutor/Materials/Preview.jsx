import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PortalLayout from '@/Layouts/PortalLayout';
import MaterialViewer from '@/Components/Materials/MaterialViewer';

export default function Preview({ material }) {
    const backToMaterials = () => router.visit(route('tutor.materials.index'));

    return (
        <PortalLayout>
            <Head title={`Pratinjau: ${material.title}`} />

            <button
                type="button"
                onClick={backToMaterials}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="h-4 w-4" /> Kembali ke Kelola Materi
            </button>

            <MaterialViewer material={material} readOnly onClose={backToMaterials} />
        </PortalLayout>
    );
}
