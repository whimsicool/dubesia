<?php

namespace App\Enums;

enum RoomType: string
{
    case Physical = 'physical';
    case Lab = 'lab';
    case Online = 'online';
}
