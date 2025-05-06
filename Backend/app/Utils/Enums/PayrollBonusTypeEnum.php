<?php

namespace App\Utils\Enums;

enum PayrollBonusTypeEnum: int
{
    //
    case Bonus = 0;
    case Deduction = 1;

    public function label(): string
    {
        return match ($this) {
            self::Bonus => "Bonus",
            self::Deduction => "Deduction",
        };
    }
}
