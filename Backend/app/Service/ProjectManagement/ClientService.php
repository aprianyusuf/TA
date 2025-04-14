<?php

namespace App\Service\ProjectManagement;

use App\Http\Resources\ProjectManagement\ClientProjectResource;
use App\Http\Resources\ProjectManagement\ClientProjectUserResource;
use App\Http\Resources\ProjectManagement\ClientResource;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClientService
{
    public function __construct(
        protected Request $request
    ) {}

    public function get(Request $request)
    {
        $query = DB::query()
            ->from('clients as c')
            ->select([
                'c.id as id',
                'c.name as name',
                DB::raw('CONCAT(u.first_name, \' \', u.last_name) as created_by'),
                'c.created_by as created_by_id'
            ])
            ->join('users as u', function (JoinClause $join) use ($request) {
                $join->on('c.created_by', 'u.id')
                    ->where('u.organization_id', $request->decoded->get('organization')?->get('id'))
                    ->whereNull('u.deleted_at');
            })
            ->whereNull('c.deleted_at')
            ->where('c.organization_id', $request->decoded->get('organization')?->get('id'));

        $count = $query->count('c.id');

        $query = $query
            ->addSelect(DB::raw('COUNT(cp.id) as client_project_count'))
            ->leftJoin('client_projects as cp', function (JoinClause $join) {
                $join->on('c.id', 'cp.client_id')
                    ->whereNull('cp.deleted_at');
            })
            ->groupBy(
                'c.id',
                'c.name',
                DB::raw('CONCAT(u.first_name, \' \', u.last_name)'),
                'c.created_by'
            )
            ->orderBy('c.id');

        $query = $query
            ->skip(($request->get('page', 1) - 1) * $request->get('size', 10))
            ->limit($request->get('size', 10))
            ->get();

        return [ClientResource::collection($query), $count];
    }

    public function createClient(Request $request)
    {
        $id = DB::table('clients')
            ->insertGetId([
                'id' => Str::ulid(),
                'name'              => $request->name,
                'organization_id'   => $request->decoded->get('organization')?->get('id'),
                'created_by'        => $request->decoded->get('id'),
                'created_at'        => now(),
            ]);

        return ClientResource::make($this->showClient($request, $id));
    }

    public function updateClient(Request $request, string $id)
    {
        DB::table('clients')
            ->where('id', $id)
            ->update([
                'name' => $request->name
            ]);

        return ClientResource::make($this->showClient($request, $id));
    }

    public function showClient(Request $request, string $id)
    {
        return DB::query()
            ->from('clients as c')
            ->select([
                'c.id as id',
                'c.name as name',
                DB::raw('CONCAT(u.first_name, \' \', u.last_name) as created_by'),
                'c.created_by as created_by_id'
            ])
            ->join('users as u', function (JoinClause $join) use ($request) {
                $join->on('c.created_by', 'u.id')
                    ->where('u.organization_id', $request->decoded->get('organization')?->get('id'))
                    ->whereNull('c.deleted_at');
            })
            ->where('c.id', $id)
            ->where('c.organization_id', $request->decoded->get('organization')?->get('id'))
            ->first();
    }

    public function deleteClient(string $id)
    {
        DB::transaction(function () use ($id) {
            DB::table('clients')
                ->where('id', $id)
                ->update([
                    'deleted_at' => now()
                ]);

            DB::table('client_projects')
                ->where('client_id', $id)
                ->update([
                    'deleted_at' => now()
                ]);
        }, 3);
    }

    public function projectByClient(Request $request, string $client)
    {
        $query = DB::query()
            ->from('client_projects as cp')
            ->select([
                'cp.id as id',
                'cp.client_id as client_id',
                'c.name as client',
                'cp.name as name',
                'cp.color as color',
                'cp.start_date_at as start_date_at',
                'cp.end_date_at as end_date_at',
                'cp.cut_off_timesheet_start_day as cut_off_timesheet_start_day',
                'cp.cut_off_timesheet_end_day as cut_off_timesheet_end_day',
                'cp.is_requires_project_manager_approval as is_requires_project_manager_approval',

                'cp.project_manager_id as project_manager_id',
                DB::raw('CONCAT(u.first_name, \' \', u.last_name) as project_manager'),
                'u.email as project_manager_email',

                'cp.created_by as created_by_id',
                DB::raw('CONCAT(u2.first_name, \' \', u2.last_name) as created_by'),
            ])
            ->join('clients as c', function (JoinClause $join) use ($request) {
                $join->on('cp.client_id', 'c.id')
                    ->where('c.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->join('users as u', function (JoinClause $join) use ($request) {
                $join->on('cp.project_manager_id', 'u.id')
                    ->where('u.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->join('users as u2', function (JoinClause $join) use ($request) {
                $join->on('cp.created_by', 'u2.id')
                    ->where('u2.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->where('client_id', $client)
            ->whereNull('cp.deleted_at');

        $count = $query->count();

        $query = $query
            ->skip(($request->get('page', 1) - 1) * $request->get('size', 10))
            ->limit($request->get('size', 10))
            ->get();

        return [ClientProjectResource::collection($query), $count];
    }

    public function createProjectByClient(Request $request, string $client)
    {
        $id = DB::table('client_projects')
            ->insertGetId([
                'id' => Str::ulid(),
                'client_id' => $client,
                'name' => $request->name,
                'start_date_at' => $request->startDate,
                'end_date_at' => $request->endDate,
                'cut_off_timesheet_start_day' => $request->cutOffTimesheetStartDay,
                'cut_off_timesheet_end_day' => $request->cutOffTimesheetEndDay,
                'project_manager_id' => $request->projectManagerId,
                'color' => $request->color,
                'is_requires_project_manager_approval' => $request->isRequiresProjectManagerApproval,
                'created_at' => now(),
                'created_by' => $request->decoded->get('id')
            ]);

        $clientProject = $this->showProjectByClient($request, $client, $id);

        return ClientProjectResource::make($clientProject);
    }

    public function showProjectByClient(Request $request, string $client, string $id)
    {
        return DB::query()
            ->from('client_projects as cp')
            ->select([
                'cp.id as id',
                'cp.client_id as client_id',
                'c.name as client',
                'cp.name as name',
                'cp.color as color',
                'cp.start_date_at as start_date_at',
                'cp.end_date_at as end_date_at',
                'cp.cut_off_timesheet_start_day as cut_off_timesheet_start_day',
                'cp.cut_off_timesheet_end_day as cut_off_timesheet_end_day',
                'cp.is_requires_project_manager_approval as is_requires_project_manager_approval',

                'cp.project_manager_id as project_manager_id',
                DB::raw('CONCAT(u.first_name, \' \', u.last_name) as project_manager'),
                'u.email as project_manager_email',

                'cp.created_by as created_by_id',
                DB::raw('CONCAT(u2.first_name, \' \', u2.last_name) as created_by'),
            ])
            ->join('clients as c', function (JoinClause $join) use ($request) {
                $join->on('cp.client_id', 'c.id')
                    ->where('c.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->join('users as u', function (JoinClause $join) use ($request) {
                $join->on('cp.project_manager_id', 'u.id')
                    ->where('u.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->join('users as u2', function (JoinClause $join) use ($request) {
                $join->on('cp.created_by', 'u2.id')
                    ->where('u2.organization_id', $request->decoded->get('organization')?->get('id'));
            })
            ->where('cp.client_id', $client)
            ->where('cp.id', $id)
            ->first();
    }

    public function updateProjectByClient(Request $request, string $client, string $id)
    {
        DB::table('client_projects')
            ->where('id', $id)
            ->where('client_id', $client)
            ->update([
                'name' => $request->name,
                'start_date_at' => $request->startDate,
                'end_date_at' => $request->endDate,
                'cut_off_timesheet_start_day' => $request->cutOffTimesheetStartDay,
                'cut_off_timesheet_end_day' => $request->cutOffTimesheetEndDay,
                'project_manager_id' => $request->projectManagerId,
                'is_requires_project_manager_approval' => $request->isRequiresProjectManagerApproval,
                'color' => $request->color,
                'updated_at' => now(),
            ]);

        return ClientResource::make(
            $this->showProjectByClient($request, $client, $id)
        );
    }

    public function deleteProjectByClient(string $client, string $id)
    {
        DB::table('client_projects')
            ->where('id', $id)
            ->where('client_id', $client)
            ->update([
                'deleted_at' => now()
            ]);
    }

    public function clientProjectUser(Request $request, string $client, string $id)
    {
        $projectManager = DB::query()
            ->from('client_projects as cp')
            ->select([
                'u.id as user_id',
                'cp.id as client_project_id',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as user_full_name"),
                'cp.name as client_project_name',
                DB::raw("1 as is_active"),
                'cp.start_date_at as start_date_at',
                'cp.end_date_at as end_date_at',
            ])
            ->join('users as u', function (JoinClause $join) {
                $join->on('cp.project_manager_id', 'u.id')
                    ->whereNull('u.deleted_at');
            })
            ->where('cp.id', $id)
            ->where('cp.client_id', $client)
            ->first();

        $query = DB::query()
            ->from('client_project_user as cpu')
            ->select([
                'u.id as user_id',
                'cp.id as client_project_id',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as user_full_name"),
                'cp.name as client_project_name',
                DB::raw("case when now() BETWEEN cpu.start_date_at and cpu.end_date_at + time '23:59:59' then 1 else 0 end as is_active"),
                'cpu.start_date_at as start_date_at',
                'cpu.end_date_at as end_date_at',
            ])
            ->join('users as u', function (JoinClause $join) {
                $join->on('cpu.user_id', 'u.id')
                    ->whereNull('u.deleted_at');
            })
            ->join('client_projects as cp', function (JoinClause $join) use ($client) {
                $join->on('cpu.client_project_id', 'cp.id')
                    ->where('cp.client_id', $client)
                    ->whereNull('cp.deleted_at');
            })
            ->where('cpu.client_project_id', $id)
            ->whereNull('cpu.deleted_at');

        $count = $query->count();

        $users = $query
            ->skip(($request->get('page', 1) - 1) * $request->get('size', 10))
            ->limit($request->get('size', 10))
            ->get();

        return [ClientProjectUserResource::collection($users->prepend($projectManager)), $count + 1];
    }

    public function createClientProjectUser(Request $request, string $client, string $id)
    {
        DB::table('client_project_user')
            ->upsert([
                'start_date_at' => $request->startDate,
                'end_date_at' => $request->endDate,
                'user_id' => $request->userId,
                'client_project_id' => $id,
                'deleted_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ], ['user_id', 'client_project_id'], [
                'start_date_at',
                'end_date_at',
                'created_at',
                'updated_at',
                'deleted_at',
            ]);

        return ClientProjectUserResource::make(
            $this->showClientProjectUser($request, $client, $id, $request->userId)
        );
    }

    public function showClientProjectUser(Request $request, string $client, string $project, string $id)
    {
        return DB::query()
            ->from('client_project_user as cpu')
            ->select([
                'u.id as user_id',
                'cp.id as client_project_id',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as user_full_name"),
                'cp.name as client_project_name',
                DB::raw("case when now() BETWEEN cpu.start_date_at and cpu.end_date_at + time '23:59:59' then 1 else 0 end as is_active"),
                'cpu.start_date_at as start_date_at',
                'cpu.end_date_at as end_date_at',
            ])
            ->join('users as u', function (JoinClause $join) use ($request) {
                $join->on('cpu.user_id', 'u.id')
                    ->where('u.organization_id', $request->decoded->get('organization')?->get('id'))
                    ->whereNull('u.deleted_at');
            })
            ->join('client_projects as cp', function (JoinClause $join) use ($client) {
                $join->on('cpu.client_project_id', 'cp.id')
                    ->where('cp.client_id', $client)
                    ->whereNull('cp.deleted_at');
            })
            ->where('cpu.client_project_id', $project)
            ->where('cpu.user_id', $id)
            ->whereNull('cpu.deleted_at')
            ->first();
    }

    public function updateClientProjectUser(Request $request, string $client, string $project, string $id)
    {
        DB::table('client_project_user')
            ->where('client_project_id', $project)
            ->where('user_id', $id)
            ->update([
                'start_date_at' => $request->startDate,
                'end_date_at' => $request->endDate,
            ]);

        return ClientProjectUserResource::make(
            $this->showClientProjectUser($request, $client, $project, $id)
        );
    }

    public function deleteClientProjectUser(string $project, string $id)
    {
        DB::table('client_project_user')
            ->where('client_project_id', $project)
            ->where('user_id', $id)
            ->update([
                'deleted_at' => now()
            ]);
    }

    public function getEmployeeProject()
    {
        $asProjectManager = DB::query()
            ->from('client_projects as cp')
            ->select([
                'cp.id as value',
                'cp.name as label',
            ])
            ->where('cp.project_manager_id', $this->request->decoded->get('id'))
            ->where(function (Builder $query) {
                if ($this->request->startDateAt !== null) {
                    $query->whereRaw("? BETWEEN cp.start_date_at and cp.end_date_at + time '23:59:59'", [$this->request->startDateAt]);
                }
            })
            ->whereNull('cp.deleted_at');

        return DB::query()
            ->from('client_project_user as cpu')
            ->select([
                'cpu.client_project_id as value',
                'cp.name as label',
            ])
            ->join('users as u', function (JoinClause $join) {
                $join->on('cpu.user_id', 'u.id')
                    ->whereNull('u.deleted_at')
                    ->where('u.organization_id', $this->request->decoded->get('organization')?->get('id'));
            })
            ->join('client_projects as cp', function (JoinClause $join) {
                $join->on('cpu.client_project_id', 'cp.id')
                    ->whereNull('cp.deleted_at');
            })
            ->where('cpu.user_id', $this->request->decoded->get('id'))
            ->whereNull('cpu.deleted_at')
            ->union($asProjectManager)
            ->where(function (Builder $query) {
                if ($this->request->startDateAt !== null) {
                    $query->whereRaw("? BETWEEN cpu.start_date_at and cpu.end_date_at + time '23:59:59'", [$this->request->startDateAt]);
                }
            })
            ->distinct()
            ->get();
    }
}
