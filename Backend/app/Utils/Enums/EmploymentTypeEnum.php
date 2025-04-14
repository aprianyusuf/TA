<?php

namespace App\Utils\Enums;

enum EmploymentTypeEnum: string
{
    case Permanent = "Permanent";
    case Contract = "Contract";
    case Internship = "Internship";
    case Outsource = "Outsource";

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