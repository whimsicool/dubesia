<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case Present = 'present';
    case Permit = 'permit';
    case Sick = 'sick';
    case Absent = 'absent';
}
