<?php

use App\Http\Controllers\ScheduleViewController;
use Illuminate\Support\Facades\Route;

Route::get('/tutor/schedules', [ScheduleViewController::class, 'index'])
    ->middleware(['auth', 'role:tutor,teacher'])
    ->name('tutor.schedules.index');

Route::get('/schedules', [ScheduleViewController::class, 'index'])
    ->middleware(['auth', 'role:student'])
    ->name('schedules.index');
