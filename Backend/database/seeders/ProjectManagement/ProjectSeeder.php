<?php

namespace Database\Seeders\ProjectManagement;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = [
            [
                'name' => 'Artha',
                'organization_id' => DB::table('organizations')->select('id')->where('domain', 'rootdigitaltechnology.com')->value('id'),
                'created_by' => DB::table('users')->select('id')->where('first_name', 'Deo')->value('id'),
                'projects' => [
                    [
                        'name' => 'MPH',
                        'start_date_at' => '2024-12-01',
                        'end_date_at' => '2025-06-30',
                        'color' => '#00ffff',
                        'cut_off_timesheet_start_day' => 1,
                        'cut_off_timesheet_end_day' => 30,
                        'project_manager_id' => DB::table('users')->select('id')->where('first_name', 'Deo')->value('id'),
                        'is_requires_project_manager_approval' => true,
                        'created_by' => DB::table('users')->select('id')->where('first_name', 'Deo')->value('id')
                    ]
                ]
            ]
        ];

        $clients = toCollectionRecursive($clients);
        foreach ($clients as $client) {
            $id = Str::ulid();
            DB::table('clients')
                ->insert([
                    'id' => $id,
                    'organization_id' => $client->get('organization_id'),
                    'name' => $client->get('name'),
                    'created_by' => $client->get('created_by'),
                    'created_at' => now()
                ]);

            foreach ($client->get('projects') as $project) {
                $p = Str::ulid();
                DB::table('client_projects')
                    ->insertGetId([
                        'id' => $p,
                        'client_id' => $id,
                        'name' => $project->get('name'),
                        'start_date_at' => $project->get('start_date_at'),
                        'end_date_at' => $project->get('end_date_at'),
                        'color' => $project->get('color'),
                        'cut_off_timesheet_start_day' => $project->get('cut_off_timesheet_start_day'),
                        'cut_off_timesheet_end_day' => $project->get('cut_off_timesheet_end_day'),
                        'project_manager_id' => $project->get('project_manager_id'),
                        'is_requires_project_manager_approval' => $project->get('is_requires_project_manager_approval'),
                        'created_by' => $project->get('created_by'),
                        'created_at' => now()
                    ]);

                DB::table('users')
                    ->select(['*'])
                    ->where('id', '<>', $project->get('created_by'))
                    ->where('organization_id', $client->get('organization_id'))
                    ->get()
                    ->each(function ($item) use ($p, $project) {
                        DB::table('client_project_user')
                            ->insert([
                                'user_id' => $item->id,
                                'client_project_id' => $p,
                                'start_date_at' => $project->get('start_date_at'),
                                'end_date_at' => Carbon::createFromFormat('Y-m-d', $project->get('start_date_at'))->addDays(rand(60, Carbon::createFromFormat('Y-m-d', $project->get('start_date_at'))->diffInDays(Carbon::createFromFormat('Y-m-d', $project->get('end_date_at'))))),
                                'created_at' => now()
                            ]);
                    });
            }
        }
    }
}
