<?php

namespace Tests\Feature;

use App\Models\HasilTes;
use App\Models\JawabanTes;
use App\Models\Pendaftaran;
use App\Models\SoalTes;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TesLevelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat bank soal tes (5 soal untuk unit testing)
        for ($i = 1; $i <= 5; $i++) {
            SoalTes::create([
                'kode_soal' => 'S'.str_pad($i, 3, '0', STR_PAD_LEFT),
                'pertanyaan' => "Pertanyaan tes nomor {$i}",
                'pilihan_a' => 'Pilihan A',
                'pilihan_b' => 'Pilihan B',
                'pilihan_c' => 'Pilihan C',
                'pilihan_d' => 'Pilihan D',
                'kunci_jawaban' => 'A',
            ]);
        }
    }

    /**
     * Tes penempatan hanya terbuka untuk murid baru yang pendaftarannya
     * sudah terverifikasi, sesuai middleware placement.test.
     */
    private function createApprovedStudent(): User
    {
        $user = User::factory()->create();

        Pendaftaran::create([
            'user_id' => $user->id,
            'nama_lengkap' => $user->name,
            'tanggal_lahir' => '2005-04-12',
            'email' => $user->email,
            'no_whatsapp' => '081234567890',
            'alamat' => 'Jl. Merdeka 1',
            'program' => 'toefl_ielts',
            'bukti_pembayaran' => 'bukti/pembayaran.jpg',
            'status' => Pendaftaran::STATUS_TERVERIFIKASI,
            'verified_at' => now(),
        ]);

        return $user;
    }

    public function test_unauthenticated_user_cannot_access_tes_level(): void
    {
        $response = $this->get('/tes-level');
        $response->assertRedirect('/login');
    }

    public function test_student_can_view_tes_level_index(): void
    {
        $user = $this->createApprovedStudent();

        $response = $this->actingAs($user)->get('/tes-level');
        $response->assertStatus(200);
    }

    public function test_student_can_start_tes_session(): void
    {
        $user = $this->createApprovedStudent();

        $response = $this->actingAs($user)->post('/tes-level/start');
        $response->assertRedirect('/tes-level/take');

        $this->assertDatabaseHas('hasil_tes', [
            'id_murid' => $user->id,
            'status_hasil' => 'in_progress',
        ]);
    }

    public function test_student_can_auto_save_answer(): void
    {
        $user = $this->createApprovedStudent();

        $this->actingAs($user)->post('/tes-level/start');

        $response = $this->actingAs($user)->postJson('/tes-level/auto-save', [
            'kode_soal' => 'S001',
            'jawaban_murid' => 'A',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('jawaban_tes', [
            'id_murid' => $user->id,
            'kode_soal' => 'S001',
            'jawaban_murid' => 'A',
        ]);
    }

    public function test_student_can_toggle_tandai_ragu_ragu(): void
    {
        $user = $this->createApprovedStudent();

        $this->actingAs($user)->post('/tes-level/start');

        $response = $this->actingAs($user)->postJson('/tes-level/toggle-tandai', [
            'kode_soal' => 'S001',
            'status_tandai' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('jawaban_tes', [
            'id_murid' => $user->id,
            'kode_soal' => 'S001',
            'status_tandai' => true,
        ]);
    }

    public function test_student_submit_calculates_correct_score_and_level(): void
    {
        $user = $this->createApprovedStudent();

        $this->actingAs($user)->post('/tes-level/start');

        // Jawab 5 dari 5 benar = 100% -> Upper Intermediate
        for ($i = 1; $i <= 5; $i++) {
            $kode = 'S'.str_pad($i, 3, '0', STR_PAD_LEFT);
            JawabanTes::saveJawaban($user->id, $kode, 'A');
        }

        $response = $this->actingAs($user)->post('/tes-level/submit');

        $hasil = HasilTes::where('id_murid', $user->id)->first();
        $this->assertNotNull($hasil);
        $this->assertEquals(5, $hasil->jumlah_benar);
        $this->assertEquals(0, $hasil->jumlah_salah);
        $this->assertEquals(100.0, $hasil->nilai_tes);
        $this->assertEquals('Upper Intermediate', $hasil->level_kelas);
        $this->assertEquals('completed', $hasil->status_hasil);

        $response->assertRedirect(route('tes-level.onboarding-result', $hasil->id_hasil));
    }

    public function test_grading_logic_thresholds(): void
    {
        // < 80 => Beginner
        $this->assertEquals('Beginner', HasilTes::tentukanLevelKelas(79.99));
        $this->assertEquals('Beginner', HasilTes::tentukanLevelKelas(50));

        // 80 - 85 => Low Intermediate
        $this->assertEquals('Low Intermediate', HasilTes::tentukanLevelKelas(80.0));
        $this->assertEquals('Low Intermediate', HasilTes::tentukanLevelKelas(85.0));

        // 86 - 89 => Middle Intermediate
        $this->assertEquals('Middle Intermediate', HasilTes::tentukanLevelKelas(86.0));
        $this->assertEquals('Middle Intermediate', HasilTes::tentukanLevelKelas(89.0));

        // 90 - 100 => Upper Intermediate
        $this->assertEquals('Upper Intermediate', HasilTes::tentukanLevelKelas(90.0));
        $this->assertEquals('Upper Intermediate', HasilTes::tentukanLevelKelas(100.0));
    }
}
