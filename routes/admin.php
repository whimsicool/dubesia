<?php

use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\ScheduleController;
use Illuminate\Support\Facades\Route;

/*
| Semua route di sini hanya untuk role "admin".
| Di-load dari routes/web.php:  require __DIR__.'/admin.php';
*/
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::prefix('schedules')->name('schedules.')->controller(ScheduleController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/export', 'export')->name('export');
            Route::post('/', 'store')->name('store');
            Route::post('/check-conflict', 'checkConflict')->name('check-conflict');
            Route::put('/{schedule}', 'update')->whereNumber('schedule')->name('update');
            Route::delete('/{schedule}', 'destroy')->whereNumber('schedule')->name('destroy');
        });

        Route::prefix('classes')->name('classes.')->controller(ClassController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::put('/{courseClass}/students', 'syncStudents')->whereNumber('courseClass')->name('students');
            Route::patch('/{courseClass}/status', 'toggleStatus')->whereNumber('courseClass')->name('status');
            Route::put('/{courseClass}', 'update')->whereNumber('courseClass')->name('update');
            Route::delete('/{courseClass}', 'destroy')->whereNumber('courseClass')->name('destroy');
        });

        Route::prefix('rooms')->name('rooms.')->controller(RoomController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::patch('/{room}/status', 'toggleStatus')->whereNumber('room')->name('status');
            Route::put('/{room}', 'update')->whereNumber('room')->name('update');
            Route::delete('/{room}', 'destroy')->whereNumber('room')->name('destroy');
        });
    });

// Fitur materi belajar (guru: kelola, semua user: pustaka)
require __DIR__.'/materials.php';
