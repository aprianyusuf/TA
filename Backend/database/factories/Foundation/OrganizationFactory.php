<?php

namespace Database\Factories\Foundation;

use App\Models\Foundation\Employee;
use App\Models\Foundation\Organization;
use App\Models\User;
use DateTime;
use DateTimeZone;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Organization>
 */
class OrganizationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $day = rand(1, 30);
        $timezone = DateTimeZone::listIdentifiers(DateTimeZone::ALL);
        $randTimezone = $timezone[array_rand($timezone)];

        $timezone = new DateTimeZone($randTimezone);
        $datetime = new DateTime('now', $timezone);

        $offsetInHours = $timezone->getOffset($datetime) / 60 / 60;
        return [
            'id' => Str::ulid(),
            'name' => fake()->company(),
            'domain' => fake()->domainName(),
            'address' => fake()->address(),
            'cut_off_timesheet_start_day' => $day,
            'cut_off_timesheet_end_day' => $day === 1 ? 30 : $day - 1,
            'timezone' => $randTimezone,
            'timezone_offset' => $offsetInHours,
        ];
    }
}
