<?php

namespace App\Utils\Enums;

enum LeaveRequestStatus: int
{
    case Pending   = 0;
    case Approved  = 1;
    case Cancelled = 2;
    case Rejected  = 3;

    public function label(): string
    {
        return match ($this) {
            self::Pending   => 'Pending',
            self::Approved  => 'Approved',
            self::Cancelled => 'Cancelled',
            self::Rejected  => 'Rejected',
        };
    }
}
