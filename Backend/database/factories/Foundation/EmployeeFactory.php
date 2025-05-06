<?php
namespace Database\Factories\Foundation;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Foundation\Employee>
 */
class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id'              => Str::ulid(),
            'employee_id'     => fake()->bothify('ID/???????/##########'),
            'marital'         => fake()->randomElement(['Married', 'Single', 'Widow', 'Widowr']),
            'religion'        => fake()->randomElement(['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Konghucu']),
            'birth_at'        => fake()->dateTimeBetween('-50 years', '-20 years'),
            'hired_start_at'  => fake()->dateTimeBetween('-5 years'),
            'identity_number' => fake()->numerify('################'),
            'salary'          => 5000000,
        ];
    }
}
