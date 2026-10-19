<?php

use App\Http\Controllers\Admin\FeedbackController as AdminFeedbackController;
use App\Http\Controllers\Admin\VerifikasiPendaftaranController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrasiController;
use App\Http\Controllers\StatusPendaftaranController;
use App\Http\Controllers\Student\FeedbackController;
use App\Http\Controllers\Student\GradeController as StudentGradeViewController;
use App\Http\Controllers\StudentGradeController;
use App\Http\Controllers\TesLevelController;
use App\Http\Controllers\Tutor\GradeComponentController;
use App\Http\Controllers\Tutor\StudentClassGradeController;
use App\Http\Controllers\TutorClassController;
use App\Http\Controllers\TutorClassStudentController;
use App\Models\Pendaftaran;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\CalonMuridController;

Route::patch(
    '/admin/pendaftaran/{pendaftaran}/verifikasi',
    [VerifikasiPendaftaranController::class, 'update']
)->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.pendaftaran.verifikasi');

Route::get('/admin/pendaftaran', [VerifikasiPendaftaranController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.pendaftaran.index');

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
    $pendaftaran = auth()->user()?->pendaftaran;

    if ($pendaftaran && $pendaftaran->status !== Pendaftaran::STATUS_TERVERIFIKASI) {
        return redirect()->route('pendaftaran.status');
    }

    $dashboardRoute = match (auth()->user()?->role) {
        'student' => 'student.dashboard',
        'tutor' => 'tutor.dashboard',
        'admin' => 'admin.dashboard',
        default => null,
    };

    if ($dashboardRoute) {
        return redirect()->route($dashboardRoute);
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/pendaftaran/status', StatusPendaftaranController::class)
    ->middleware(['auth', 'verified', 'role:student'])
    ->name('pendaftaran.status');

Route::get('/registrasi', [RegistrasiController::class, 'create'])->name('registrasi.create');

Route::get('/tutor/dashboard', [TutorClassController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:tutor'])
    ->name('tutor.dashboard');

Route::get('/admin/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'role:admin'])->name('admin.dashboard');

Route::get('/student/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'role:student'])->name('student.dashboard');

Route::get('/admin/feedback', [AdminFeedbackController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.feedback.index');
// Student feedback routes
Route::middleware(['auth', 'verified', 'role:student'])
    ->prefix('student')
    ->name('student.')
    ->group(function () {
        Route::get('/grades', [StudentGradeViewController::class, 'index'])
            ->name('grades.index');

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

    // === Tes Level Kelas Routes ===
    Route::prefix('tes-level')->name('tes-level.')->group(function () {
        Route::get('/', [TesLevelController::class, 'index'])->name('index');
        Route::post('/start', [TesLevelController::class, 'start'])->name('start');
        Route::get('/take', [TesLevelController::class, 'takeTest'])->name('take');
        Route::post('/auto-save', [TesLevelController::class, 'autoSave'])->name('auto-save');
        Route::post('/toggle-tandai', [TesLevelController::class, 'toggleTandai'])->name('toggle-tandai');
        Route::post('/submit', [TesLevelController::class, 'submit'])->name('submit');
        Route::get('/result/{id}', [TesLevelController::class, 'result'])->name('result');
    });
});
// Registrasi murid tetap boleh dikirim saat browser masih memiliki sesi
// admin/tutor, supaya middleware guest tidak mengalihkan submit ke dashboard.
Route::post('/registrasi', [RegistrasiController::class, 'store'])->name('registrasi.store');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/calon-murid', [CalonMuridController::class, 'index'])->name('calon-murid.index');
    Route::get('/calon-murid/{pendaftaran}', [CalonMuridController::class, 'show'])->name('calon-murid.show');
    Route::post('/calon-murid/{pendaftaran}/verifikasi', [CalonMuridController::class, 'verifikasi'])->name('calon-murid.verifikasi');
    Route::post('/calon-murid/{pendaftaran}/tolak', [CalonMuridController::class, 'tolak'])->name('calon-murid.tolak');
});
require __DIR__.'/auth.php';

