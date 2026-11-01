<?php

use App\Http\Controllers\Admin\CalonMuridController;
use App\Http\Controllers\Admin\FeedbackController as AdminFeedbackController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrasiController;
use App\Http\Controllers\Student\FeedbackController;
use App\Http\Controllers\Student\GradeController as StudentGradeViewController;
use App\Http\Controllers\StudentGradeController;
use App\Http\Controllers\TesLevelController;
use App\Http\Controllers\Tutor\AttendanceController;
use App\Http\Controllers\Tutor\GradeComponentController;
use App\Http\Controllers\Tutor\StudentClassGradeController;
use App\Http\Controllers\TutorClassController;
use App\Http\Controllers\TutorClassStudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Halaman publik pertama; pengguna yang sudah login diarahkan ke dashboard.
Route::get('/', LandingController::class)->name('landing');

// Satu dashboard universal; isinya mengikuti role user yang sedang login.
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'placement.test'])
    ->name('dashboard');

Route::get('/registrasi', [RegistrasiController::class, 'create'])->name('registrasi.create');

Route::get('/panduan-pendaftaran', function () {
    return Inertia::render('Registrasi/PanduanPendaftaran');
})->name('panduan-pendaftaran');

Route::get('/bantuan-admisi', function () {
    return Inertia::render('Registrasi/BantuanAdmisi');
})->name('bantuan-admisi');

Route::get('/tutor/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:tutor'])
    ->name('tutor.dashboard');

Route::middleware(['auth', 'role:tutor'])->prefix('tutor')->name('tutor.')->group(function () {
    Route::get('/presensi', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/presensi', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::patch('/presensi/riwayat', [AttendanceController::class, 'updateHistory'])->name('attendance.history.update');
});

Route::get('/admin/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.dashboard');

Route::get('/admin/feedback', [AdminFeedbackController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.feedback.index');

// Student feedback routes
Route::middleware(['auth', 'verified', 'role:student', 'placement.test'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('/grades', [StudentGradeViewController::class, 'index'])
            ->name('grades.index');
        Route::get('/grades/pdf', [StudentGradeViewController::class, 'pdf'])
            ->name('grades.pdf');
        Route::get('/feedback', [FeedbackController::class, 'create'])
            ->name('feedback.create');
        Route::post('/feedback', [FeedbackController::class, 'store'])
            ->name('feedback.store');
    });

Route::middleware(['auth', 'verified', 'role:tutor'])
    ->prefix('tutor')
    ->name('tutor.')
    ->group(function () {
        Route::get('/classes', [TutorClassController::class, 'index'])
            ->name('classes.index');

        Route::get(
            '/classes/{courseClass}/students',
            [TutorClassStudentController::class, 'index']
        )->name('classes.students.index');

        Route::put(
            '/classes/{courseClass}/grades',
            [TutorClassStudentController::class, 'updateGrades']
        )->name('classes.grades.update');

        Route::resource('student-grades', StudentGradeController::class)
            ->except(['show']);

        Route::resource(
            'classes.grade-components',
            GradeComponentController::class
        )
            ->parameters([
                'classes' => 'courseClass',
            ])
            ->except(['show']);

        Route::get(
            '/classes/{courseClass}/students/{student}/grades',
            [StudentClassGradeController::class, 'edit']
        )->name('classes.students.grades.edit');

        Route::put(
            '/classes/{courseClass}/students/{student}/grades',
            [StudentClassGradeController::class, 'update']
        )->name('classes.students.grades.update');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/pendaftaran/perbaiki', [RegistrasiController::class, 'edit'])->name('registrasi.edit');
    Route::put('/pendaftaran/perbaiki', [RegistrasiController::class, 'update'])->name('registrasi.update');

    // Hasil tes pribadi untuk item navigasi murid.
    Route::get('/student/hasil-tes-level', [TesLevelController::class, 'myResult'])
        ->middleware(['verified', 'role:student', 'placement.test'])
        ->name('student.placement-result');

    // === Tes Level Kelas Routes ===
    Route::prefix('tes-level')->name('tes-level.')->middleware(['verified', 'role:student', 'placement.test'])->group(function () {
        Route::get('/', [TesLevelController::class, 'index'])->name('index');
        Route::post('/start', [TesLevelController::class, 'start'])->name('start');
        Route::get('/take', [TesLevelController::class, 'takeTest'])->name('take');
        Route::post('/auto-save', [TesLevelController::class, 'autoSave'])->name('auto-save');
        Route::post('/toggle-tandai', [TesLevelController::class, 'toggleTandai'])->name('toggle-tandai');
        Route::post('/submit', [TesLevelController::class, 'submit'])->name('submit');
        Route::get('/onboarding-result/{id}', [TesLevelController::class, 'onboardingResult'])->name('onboarding-result');
        Route::get('/result/{id}', [TesLevelController::class, 'result'])->name('result');
    });
});
// Registrasi murid tetap boleh dikirim saat browser masih memiliki sesi
// admin/tutor, supaya middleware guest tidak mengalihkan submit ke dashboard.
Route::post('/registrasi', [RegistrasiController::class, 'store'])->name('registrasi.store');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/calon-murid', [CalonMuridController::class, 'index'])->name('calon-murid.index');
    Route::get('/calon-murid/{pendaftaran}/bukti-pembayaran', [CalonMuridController::class, 'buktiPembayaran'])->name('calon-murid.bukti');
    Route::get('/calon-murid/{pendaftaran}', [CalonMuridController::class, 'show'])->name('calon-murid.show');
    Route::post('/calon-murid/{pendaftaran}/verifikasi', [CalonMuridController::class, 'verifikasi'])->name('calon-murid.verifikasi');
    Route::post('/calon-murid/{pendaftaran}/tolak', [CalonMuridController::class, 'tolak'])->name('calon-murid.tolak');

    Route::prefix('data-pengguna')->name('data-pengguna.')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('index');
        Route::post('/', [AdminUserController::class, 'store'])->name('store');
        Route::post('/bulk-delete', [AdminUserController::class, 'bulkDestroy'])->name('bulk-destroy');
        Route::get('/{user}', [AdminUserController::class, 'show'])->name('show');
        Route::put('/{user}', [AdminUserController::class, 'update'])->name('update');
        Route::delete('/{user}', [AdminUserController::class, 'destroy'])->name('destroy');
    });
});
require __DIR__ . '/auth.php';
require __DIR__ . '/schedules.php';
require __DIR__ . '/admin.php';
