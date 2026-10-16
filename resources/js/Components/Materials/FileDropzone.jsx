import { useRef, useState } from 'react';
import { FileUp, X } from 'lucide-react';

function humanSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Area drag & drop / pilih berkas, dengan batas ukuran & progress unggah. */
export default function FileDropzone({ file, onFile, extensions, maxMb, existing, progress, error }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [localError, setLocalError] = useState(null);

    const accept = extensions.map((e) => `.${e}`).join(',');

    const pick = (f) => {
        if (!f) return;

        const ext = f.name.split('.').pop().toLowerCase();
        if (!extensions.includes(ext)) {
            setLocalError(`Format .${ext} tidak didukung. Gunakan: ${extensions.join(', ')}.`);
            return;
        }
        if (f.size > maxMb * 1024 * 1024) {
            setLocalError(`Ukuran berkas ${humanSize(f.size)} melebihi batas ${maxMb} MB.`);
            return;
        }

        setLocalError(null);
        onFile(f);
    };

    return (
        <div>
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pick(e.dataTransfer.files?.[0]);
                }}
                className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
                    dragging ? 'border-red-600 bg-red-50' : 'border-slate-300 bg-slate-50'
                }`}
            >
                {file ? (
                    <div className="flex items-center justify-center gap-3 text-sm">
                        <FileUp className="h-5 w-5 text-red-700" />
                        <span className="font-semibold text-slate-900">{file.name}</span>
                        <span className="text-slate-500">({humanSize(file.size)})</span>
                        <button type="button" onClick={() => onFile(null)} className="rounded p-1 text-slate-400 hover:bg-slate-200" aria-label="Hapus berkas terpilih">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <FileUp className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-2 text-sm text-slate-600">
                            Tarik berkas ke sini atau{' '}
                            <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-red-700 hover:underline">
                                pilih dari perangkat
                            </button>
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            {extensions.map((e) => e.toUpperCase()).join(', ')} • maks. {maxMb} MB
                        </p>
                    </>
                )}

                <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files?.[0])} data-testid="file-input" />
            </div>

            {existing && !file && (
                <p className="mt-2 text-xs text-slate-500">
                    Berkas saat ini: <strong className="text-slate-800">{existing.name}</strong> ({existing.size_label}). Pilih berkas baru untuk menggantinya.
                </p>
            )}

            {progress && (
                <div className="mt-3" role="progressbar" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full bg-red-700 transition-all" style={{ width: `${progress.percentage}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Mengunggah… {progress.percentage}%</p>
                </div>
            )}

            {(localError || error) && <p className="mt-2 text-xs text-red-700">{localError || error}</p>}
        </div>
    );
}
