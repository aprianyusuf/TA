<?php

namespace App\Utils\Constants;

enum TimesheetStatus: int {
    case DRAFT = 0;
    case SUBMIT = 1;
    case REJECTED = 2;
    case REVISED = 3;
    case COMPLETED = 4;

    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function array(): array
    {
        return array_combine(self::values(), self::names());
    }
}