<?php

namespace App\Utils\Constants;

enum TimesheetApprovalStatus: int {
    case WAITING = 0;
    case PENDING = 1;
    case APPROVED = 2;
    case REJECTED = 3;
    case REVISED = 4;
    case SUBMIT = 5;
    case RESUBMIT = 6;
    case COMPLETED = 7;

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

    public static function workflowStatuses(): array
    {
        $filtered = array_filter(self::cases(), function ($case) {
            return in_array($case, [
                self::WAITING,
                self::PENDING,
                self::APPROVED,
                self::REJECTED,
                self::COMPLETED,
            ]);
        });

        return array_map(fn($case) => $case->value, $filtered);
    }
}