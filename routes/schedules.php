<?php

use App\Http\Controllers\ScheduleViewController;
use App\Http\Controllers\Tutor\ScheduleAttendanceController;
use Illuminate\Support\Facades\Route;

Route::get('/tutor/schedules', [ScheduleViewController::class, 'index'])
    ->middleware(['auth', 'role:tutor'])
    ->name('tutor.schedules.index');

Route::get('/schedules', [ScheduleViewController::class, 'index'])
    ->middleware(['auth', 'verified', 'role:student', 'placement.test'])
    ->name('schedules.index');


Route::get('/tutor/schedules/{schedule}/attendance', [ScheduleAttendanceController::class, 'show'])
    ->middleware(['auth', 'role:tutor'])
    ->name('tutor.schedules.attendance');

Route::put('/tutor/schedules/{schedule}/attendance', [ScheduleAttendanceController::class, 'store'])
    ->middleware(['auth', 'role:tutor'])
    ->name('tutor.schedules.attendance.store');
Route::get('/tutor/schedules/pdf', [ScheduleViewController::class, 'pdf'])
    ->middleware(['auth', 'role:tutor'])
    ->name('tutor.schedules.pdf');

Route::get('/schedules/pdf', [ScheduleViewController::class, 'pdf'])
    ->middleware(['auth', 'verified', 'role:student', 'placement.test'])
    ->name('schedules.pdf');
