<?php

namespace App\Utils\Enums;

enum PayrollStatusEnum: int
{
    //
    case Draft   = 0;
    case Pending  = 1;
    case Processing = 2;
    case Paid  = 3;
    case Cancelled = 4;

    public function label(): string
    {
        return match ($this) {
            self::Draft => "Draft",
            self::Pending => "Pending",
            self::Processing => "Processing",
            self::Paid => "Paid",
            self::Cancelled => "Cancelled",
        };
    }
}
