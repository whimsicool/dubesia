<?php

namespace App\Http\Controllers;

use App\Models\HasilTes;
use App\Models\JawabanTes;
use App\Models\SoalTes;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TesLevelController extends Controller
{
    /**
     * Step 1: Menampilkan halaman informasi tes (detail tes, jumlah soal, durasi).
     * Sequence Diagram: 1. Klik Menu "Tes" → 1.1 GetDetailInfoTes() → 1.1.1 GetDataTes()
     */
    public function index()
    {
        $user = auth()->user();
        $totalSoal = SoalTes::count();

        // Cek apakah murid sudah pernah menyelesaikan tes
        $hasilTes = HasilTes::where('id_murid', $user->id)
            ->where('status_hasil', 'completed')
            ->latest()
            ->first();

        // Cek apakah ada sesi tes yang sedang berjalan (in_progress)
        $tesAktif = HasilTes::where('id_murid', $user->id)
            ->where('status_hasil', 'in_progress')
            ->first();

        return Inertia::render('TesLevel/Index', [
            'totalSoal' => $totalSoal,
            'durasiMenit' => 45,
            'hasilTes' => $hasilTes,
            'tesAktif' => $tesAktif,
        ]);
    }

    /**
     * Step 2-3: Memulai sesi tes baru.
     * Sequence Diagram: 2. Klik "Tes Sekarang" → 3. MulaiTes() → 3.1.1 GetSoalTes() → 3.1.2 MulaiTimerDurasiTes()
     */
    public function start()
    {
        $user = auth()->user();

        // Cek jika sudah ada tes yang sedang berjalan
        $tesAktif = HasilTes::where('id_murid', $user->id)
            ->where('status_hasil', 'in_progress')
            ->first();

        if ($tesAktif) {
            $durasiMenit = 45;
            $elapsedSeconds = now()->diffInSeconds($tesAktif->started_at);
            if ($elapsedSeconds >= $durasiMenit * 60) {
                // Sesi sebelumnya sudah habis waktunya, selesaikan sesi
                return $this->submit();
            }
        } else {
            // Hapus jawaban lama jika ada (untuk tes baru)
            JawabanTes::where('id_murid', $user->id)->delete();

            // Buat sesi tes baru
            $tesAktif = HasilTes::create([
                'id_murid' => $user->id,
                'tanggal_tes' => now()->toDateString(),
                'nama_murid' => $user->name,
                'status_hasil' => 'in_progress',
                'started_at' => now(),
            ]);
        }

        return redirect()->route('tes-level.take');
    }

    /**
     * Step 3.1.3: Menampilkan halaman pengerjaan tes (soal + pilihan jawaban + timer).
     * Sequence Diagram: 3.1.3 DisplaySoaldanPilihanJawaban()
     */
    public function takeTest()
    {
        $user = auth()->user();

        // Pastikan ada sesi tes yang berjalan
        $tesAktif = HasilTes::where('id_murid', $user->id)
            ->where('status_hasil', 'in_progress')
            ->first();

        if (!$tesAktif) {
            return redirect()->route('tes-level.index');
        }

        // Ambil semua soal
        $soalList = SoalTes::orderBy('kode_soal')->get();

        // Ambil semua jawaban yang sudah tersimpan
        $jawabanTersimpan = JawabanTes::where('id_murid', $user->id)
            ->get()
            ->keyBy('kode_soal');

        // Hitung sisa waktu berdasarkan started_at
        $durasiMenit = 45;
        $elapsedSeconds = now()->diffInSeconds($tesAktif->started_at);
        $sisaDetik = max(0, ($durasiMenit * 60) - $elapsedSeconds);

        return Inertia::render('TesLevel/TakeTest', [
            'soalList' => $soalList,
            'jawabanTersimpan' => $jawabanTersimpan,
            'sisaDetik' => (int) $sisaDetik,
            'tesAktif' => $tesAktif,
            'totalSoal' => $soalList->count(),
        ]);
    }

    /**
     * Step 4: Autosave jawaban murid (AJAX per soal).
     * Sequence Diagram: 4. Klik Jawaban → 4.1 SimpanJawabanOtomatis() → 4.1.1 SaveJawaban()
     */
    public function autoSave(Request $request)
    {
        $request->validate([
            'kode_soal' => 'required|string|exists:soal_tes,kode_soal',
            'jawaban_murid' => 'required|string|in:A,B,C,D,a,b,c,d',
        ]);

        $jawaban = JawabanTes::saveJawaban(
            auth()->id(),
            $request->kode_soal,
            $request->jawaban_murid
        );

        return response()->json([
            'success' => true,
            'message' => 'Jawaban tersimpan',
            'data' => $jawaban,
        ]);
    }

    /**
     * Step 5: Tandai soal ragu-ragu.
     * Sequence Diagram: 5. Klik Button_TandaSoal → 5.1 SimpanStatusTandai → 5.1.1 SaveStatusTandai()
     */
    public function toggleTandai(Request $request)
    {
        $request->validate([
            'kode_soal' => 'required|string|exists:soal_tes,kode_soal',
            'status_tandai' => 'required|boolean',
        ]);

        $jawaban = JawabanTes::saveStatusTandai(
            auth()->id(),
            $request->kode_soal,
            $request->status_tandai
        );

        return response()->json([
            'success' => true,
            'message' => $request->status_tandai ? 'Soal ditandai' : 'Tanda dihapus',
            'data' => $jawaban,
        ]);
    }

    /**
     * Step 6-8: Selesaikan tes (submit manual atau waktu habis).
     * Sequence Diagram:
     *   7. Klik Button_SubmitJawaban → 7.1 KonfirmasiSubmit()
     *   8. Klik Button_KonfirmasiSubmit → 8.1 SelesaikanTes()
     *     → 8.1.1 RekamSemuaJawaban()
     *     → 8.1.2 KonfirmasiRelease()
     *   ATAU (Waktu habis):
     *   6.3 DeteksiWaktuHabis → 6.4 SaveSemuaJawabanOtomatis()
     *
     * Kemudian:
     *   9.1 GetHasilTes() → 9.1.1 GetSemuaJawabanTersimpan()
     *   → 9.1.3 HitungNilaiTes() → 9.1.5 TentukanLevelKelas()
     *   → 9.1.7 SaveHasilTes()
     */
    public function submit()
    {
        $user = auth()->user();

        // Cari sesi tes aktif
        $tesAktif = HasilTes::where('id_murid', $user->id)
            ->where('status_hasil', 'in_progress')
            ->first();

        if (!$tesAktif) {
            return redirect()->route('tes-level.index');
        }

        // GetSemuaJawabanTersimpan
        $semuaJawaban = JawabanTes::getSemuaJawabanTersimpan($user->id);
        $soalList = SoalTes::all()->keyBy('kode_soal');
        $totalSoal = $soalList->count();

        // Hitung jawaban benar dan salah
        $jumlahBenar = 0;
        $jumlahSalah = 0;

        foreach ($soalList as $kodeSoal => $soal) {
            $jawaban = $semuaJawaban->firstWhere('kode_soal', $kodeSoal);

            if ($jawaban && strtoupper($jawaban->jawaban_murid) === strtoupper($soal->kunci_jawaban)) {
                $jumlahBenar++;
            } else {
                $jumlahSalah++;
            }
        }

        // HitungNilaiTes & TentukanLevelKelas & SaveHasilTes
        $nilaiTes = HasilTes::hitungNilaiTes($jumlahBenar, $totalSoal);
        $levelKelas = HasilTes::tentukanLevelKelas($nilaiTes);

        $tesAktif->update([
            'jumlah_benar' => $jumlahBenar,
            'jumlah_salah' => $jumlahSalah,
            'nilai_tes' => $nilaiTes,
            'level_kelas' => $levelKelas,
            'status_hasil' => 'completed',
            'completed_at' => now(),
        ]);

        return redirect()->route('tes-level.result', $tesAktif->id_hasil);
    }

    /**
     * Step 9: Menampilkan halaman hasil tes.
     * Sequence Diagram: 9.2 DisplayNilaiTes() → 9.3 DisplayLevelKelas()
     */
    public function result($id)
    {
        $user = auth()->user();

        $hasilTes = HasilTes::where('id_hasil', $id)
            ->where('id_murid', $user->id)
            ->where('status_hasil', 'completed')
            ->firstOrFail();

        $totalSoal = SoalTes::count();

        return Inertia::render('TesLevel/Result', [
            'hasilTes' => $hasilTes,
            'totalSoal' => $totalSoal,
        ]);
    }
}
