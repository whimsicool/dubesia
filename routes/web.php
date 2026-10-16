<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\FeedbackController;
use App\Http\Controllers\Admin\FeedbackController as AdminFeedbackController;
use App\Http\Controllers\StudentGradeController;
use App\Http\Controllers\Tutor\GradeComponentController;
use App\Http\Controllers\Tutor\StudentClassGradeController;
use App\Http\Controllers\TutorClassController;
use App\Http\Controllers\TutorClassStudentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
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

Route::get('/tutor/dashboard', [TutorClassController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:tutor,admin'])
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
        Route::get('/feedback', [FeedbackController::class, 'create'])
            ->name('feedback.create');
        Route::post('/feedback', [FeedbackController::class, 'store'])
            ->name('feedback.store');
    });
Route::middleware(['auth', 'verified', 'role:tutor,admin'])
    ->prefix('tutor')
    ->name('tutor.')
    ->group(function () {
        Route::get('/classes', [TutorClassController::class, 'index'])
            ->name('classes.index');

        Route::get(
            '/classes/{courseClass}/students',
            [TutorClassStudentController::class, 'index']
        )->name('classes.students.index');

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
});

require __DIR__.'/auth.php';
