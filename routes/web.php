<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
    if (auth()->user()?->role === 'tutor') {
        return redirect()->route('tutor.dashboard');
    }

    if (auth()->user()?->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/tutor/dashboard', function () {
    return Inertia::render('Tutor/Dashboard');
})->middleware(['auth', 'verified', 'role:tutor'])->name('tutor.dashboard');

Route::get('/admin/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'role:admin'])->name('admin.dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/schedules.php';
// >>> TAMBAHKAN <<<
require __DIR__.'/admin.php';
