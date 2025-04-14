<?php

namespace App\Service\Timesheet;

use App\Http\Resources\Timesheet\EmployeeTimesheetResource;
use App\Service\ProjectManagement\ClientService;
use App\Utils\Constants\TimesheetApprovalStatus;
use App\Utils\Constants\TimesheetStatus;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmployeeTimesheetService
{
    public function __construct(
        protected Request $request,
        protected ClientService $clientService
    ) {}

    public function getEmployeeTimesheet(string $id)
    {
        return EmployeeTimesheetResource::collection(
            DB::query()
                ->from('timesheets as t')
                ->select([
                    't.id as id',
                    't.title as title',
                    't.timezone as timezone',
                    't.start_at as start',
                    't.end_at as end',
                    't.description as description',
                    't.status as status',
                    't.client_project_id as client_project_id',
                    'cp.name as client_project',
                    'cp.color as project_color',
                    'c.name as client',
                    'c.id as client_id'
                ])
                ->selectRaw('case when ta.id is not null then ta.status else null end as approval_status')
                ->leftJoin('client_projects as cp', function (JoinClause $join) {
                    $join->on('t.client_project_id', 'cp.id')
                        ->whereNull('cp.deleted_at');
                })
                ->leftJoin('clients as c', function (JoinClause $join) {
                    $join->on('cp.client_id', 'c.id')
                        ->whereNull('c.deleted_at');
                })
                ->leftJoin('timesheet_approval as ta', function (JoinClause $join) {
                    $join->on('t.id', 'ta.timesheet_id')
                        ->where('ta.approval_id', $this->request->decoded->get('id'))
                        ->whereIn('ta.status', TimesheetApprovalStatus::workflowStatuses())
                        ->whereRaw('case when ta.approval_id = ? then 1 else 0 end = 1', [$this->request->decoded->get('id')]);
                })
                ->where('user_id', $id)
                ->whereNull('t.deleted_at')
                ->get()
        );
    }

    public function addEmployeeTimesheet()
    {
        DB::transaction(function () {
            $id = DB::table('timesheets')
                ->insertGetId([
                    'id' => Str::ulid(),
                    'user_id' => $this->request->decoded->get('id'),
                    'client_project_id' => $this->request->clientProjectId,
                    'title' => $this->request->title,
                    'timezone' => $this->request->timezone,
                    'start_at' => $this->request->startAt,
                    'end_at' => $this->request->endAt,
                    'description' => $this->request->description,
                    'status' => $this->request->status,
                    'created_at' => now()
                ]);

            if ($this->request->status === TimesheetStatus::SUBMIT->value) {
                $approvals = array();

                if ($this->request->clientProjectId !== null) {
                    $projectManager = DB::query()
                        ->from('client_projects as cp')
                        ->select([
                            'cp.project_manager_id as approval_id',
                            'cp.is_requires_project_manager_approval as is_requires_project_manager_approval'
                        ])
                        ->where('cp.id', $this->request->clientProjectId)
                        ->where('cp.project_manager_id', '<>', $this->request->decoded->get('id'))
                        ->first();

                    if ($projectManager !== null && $projectManager?->is_requires_project_manager_approval) {
                        array_push($approvals, [
                            'id' => Str::ulid(),
                            'approval_id' => $projectManager->approval_id,
                            'timesheet_id' => $id,
                            'status' => TimesheetApprovalStatus::PENDING->value,
                            'sort' => 1,
                            'created_at' => now()
                        ]);
                    }
                }

                $superior = DB::query()
                    ->from('users as u')
                    ->select([
                        'u.report_to_id as approval_id'
                    ])
                    ->where('u.id', $this->request->decoded->get('id'))
                    ->where(function (Builder $builder) use ($approvals) {
                        if (count($approvals) > 0) {
                            $projectManager = $approvals[0];
                            $builder->where('u.report_to_id', '<>', $projectManager['approval_id']);
                        }
                    })
                    ->whereNotNull('u.report_to_id')
                    ->whereNull('u.deleted_at')
                    ->first();

                if ($superior !== null) {
                    array_push($approvals, [
                        'id' => Str::ulid(),
                        'approval_id' => $superior->approval_id,
                        'timesheet_id' => $id,
                        'status' => count($approvals) > 0 ? TimesheetApprovalStatus::WAITING->value : TimesheetApprovalStatus::PENDING->value,
                        'sort' => count($approvals) + 1,
                        'created_at' => now()
                    ]);
                }

                DB::table('timesheet_approval')
                    ->insert($approvals);

                DB::table('timesheet_approval_log')
                    ->insert([
                        'id' => Str::ulid(),
                        'user_id' => $this->request->decoded->get('id'),
                        'timesheet_id' => $id,
                        'status' => TimesheetApprovalStatus::SUBMIT->value,
                        'executed_at' => now(),
                        'created_at' => now()
                    ]);

                if (count($approvals) === 0) {
                    DB::table('timesheets')
                        ->where('id', $id)
                        ->update([
                            'status' => TimesheetStatus::COMPLETED->value,
                            'updated_at' => now()
                        ]);

                    DB::table('timesheet_approval_log')
                        ->insert([
                            'id' => Str::ulid(),
                            'user_id' => $this->request->decoded->get('id'),
                            'timesheet_id' => $id,
                            'status' => TimesheetApprovalStatus::COMPLETED->value,
                            'executed_at' => now(),
                            'created_at' => now()
                        ]);
                }
            }
        }, 3);

        return $this->getEmployeeTimesheet($this->request->decoded->get('id'));
    }

    public function editEmployeeTimesheet(string $id)
    {
        DB::transaction(function () use ($id) {
            $isRevised = DB::table('timesheets as t')
                ->select(['t.status', 't.client_project_id'])
                ->selectRaw('case when (select count(ta.id) from timesheet_approval as ta where ta.timesheet_id = t.id and ta.status = ? limit 1) > 0 then true else false end as is_revised', [TimesheetApprovalStatus::REVISED->value])
                ->where('t.id', $id)
                ->first();

            DB::table('timesheets')
                ->where('id', $id)
                ->update([
                    'client_project_id' => $this->request->clientProjectId,
                    'title' => $this->request->title,
                    'timezone' => $this->request->timezone,
                    'start_at' => $this->request->startAt,
                    'end_at' => $this->request->endAt,
                    'description' => $this->request->description,
                    'status' => $this->request->status,
                    'updated_at' => now()
                ]);

            if ($this->request->status === TimesheetStatus::SUBMIT->value) {
                if ($isRevised->is_revised) {
                    // check is client project is changed then delete existing approvals and create a new approvals
                    if ($isRevised->client_project_id !== $this->request->clientProjectId) {
                        DB::table('timesheet_approval')
                            ->where('timesheet_id', $id)
                            ->delete();

                        $this->createTimesheetApprovals($id);
                    }
                    // or else update approval to pending or waiting
                    else {
                        $existingApprovals = DB::query()
                            ->from('timesheet_approval')
                            ->select(['*'])
                            ->where('timesheet_id', $id)
                            ->orderBy('sort')
                            ->get();

                        foreach ($existingApprovals as $key => $value) {
                            if ($key === 0) {
                                DB::table('timesheet_approval')
                                    ->where('id', $value->id)
                                    ->update([
                                        'status' => TimesheetApprovalStatus::PENDING->value,
                                        'updated_at' => now()
                                    ]);
                            } else {
                                DB::table('timesheet_approval')
                                    ->where('id', $value->id)
                                    ->update([
                                        'status' => TimesheetApprovalStatus::WAITING->value,
                                        'updated_at' => now()
                                    ]);
                            }
                        }
                    }

                    DB::table('timesheet_approval_log')
                        ->insert([
                            'id' => Str::ulid(),
                            'user_id' => $this->request->decoded->get('id'),
                            'timesheet_id' => $id,
                            'status' => TimesheetApprovalStatus::RESUBMIT->value,
                            'executed_at' => now(),
                            'created_at' => now()
                        ]);
                } else {
                    $insertedLog = array();

                    array_push($insertedLog, [
                        'id' => Str::ulid(),
                        'user_id' => $this->request->decoded->get('id'),
                        'timesheet_id' => $id,
                        'status' => TimesheetApprovalStatus::SUBMIT->value,
                        'executed_at' => now(),
                        'created_at' => now()
                    ]);

                    if ($this->createTimesheetApprovals($id)) {
                        array_push($insertedLog, [
                            'id' => Str::ulid(),
                            'user_id' => $this->request->decoded->get('id'),
                            'timesheet_id' => $id,
                            'status' => TimesheetApprovalStatus::COMPLETED->value,
                            'executed_at' => now(),
                            'created_at' => now()
                        ]);
                    };

                    DB::table('timesheet_approval_log')
                        ->insert($insertedLog);
                }
            }
        });

        return $this->getEmployeeTimesheet($this->request->decoded->get('id'));
    }

    public function showEmployeeTimesheet(string $id)
    {
        $timesheet = DB::query()
            ->from('timesheets as t')
            ->select([
                't.id as id',
                't.user_id as user_id',
                't.title as title',
                't.timezone as timezone',
                't.start_at as start',
                't.end_at as end',
                't.description as description',
                't.status as status',
                'cp.id as client_project_id',
                'cp.name as client_project',
                'cp.color as project_color',
                'c.name as client',
                'c.id as client_id'
            ])
            ->leftJoin('client_projects as cp', function (JoinClause $join) {
                $join->on('t.client_project_id', 'cp.id')
                    ->whereNull('cp.deleted_at');
            })
            ->leftJoin('clients as c', function (JoinClause $join) {
                $join->on('cp.client_id', 'c.id')
                    ->whereNull('c.deleted_at');
            })
            ->where('t.id', $id)
            ->first();

        $project = null;

        if ($timesheet?->client_project_id !== null && $timesheet?->client_id !== null) {
            $project = $this->clientService->showProjectByClient($this->request, $timesheet?->client_id, $timesheet?->client_project_id);
        }

        $projectUser = null;

        if ($project !== null) {
            $projectUser = $this->clientService->showClientProjectUser($this->request, $project->client_id, $project->id, $timesheet->user_id);
        }

        $approval = collect();
        $logTimesheet = collect();

        $approval = DB::query()
            ->from('timesheet_approval as ta')
            ->select([
                'ta.id as id',
                'ta.timesheet_id as timesheet_id',
                'ta.sort as sort',
                'ta.status as status',
                'ta.approval_id as approval_id',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as approval"),
            ])
            ->leftJoin('users as u', function (JoinClause $join) {
                $join->on('ta.approval_id', 'u.id');
            })
            ->where('timesheet_id', $timesheet->id)
            ->orderBy('ta.sort')
            ->get();

        $logTimesheet = DB::query()
            ->from('timesheet_approval_log as tal')
            ->select([
                'tal.id as id',
                'tal.timesheet_id as timesheet_id',
                'tal.status as status',
                'tal.notes as notes',
                'tal.executed_at as executed_at',
                'tal.user_id as user_id',
                DB::raw("CONCAT(u.first_name, ' ', u.last_name) as user"),
            ])
            ->leftJoin('users as u', function (JoinClause $join) {
                $join->on('tal.user_id', 'u.id');
            })
            ->where('timesheet_id', $timesheet->id)
            ->orderByDesc('tal.executed_at')
            ->get();

        return collect([
            'timesheet' => $timesheet,
            'project' => $project,
            'project_user' => $projectUser,
            'log_timesheet' => $logTimesheet,
            'approval' => $approval->map(function ($value) {
                $value->is_active = $this->request->decoded->get('id') === $value->approval_id && $value->status === TimesheetApprovalStatus::PENDING->value;
                return $value;
            })
        ]);
    }

    public function getSubordinate(?string $id = null)
    {
        return DB::query()
            ->from('users as u')
            ->select([
                'u.id as id',
                'u.first_name as first_name',
                'u.last_name as last_name',
                'p.name as position',
            ])
            ->selectRaw('count(case when ta.status = ? then 1 else null end) as pending_count', [TimesheetApprovalStatus::PENDING->value])
            ->join('positions as p', function (JoinClause $join) {
                $join->on('u.position_id', 'p.id')
                    ->whereNull('p.deleted_at');
            })
            ->leftJoin('timesheets as t', function (JoinClause $join) {
                $join->on('u.id', 't.user_id');
            })
            ->leftJoin('client_project_user as cpu', function (JoinClause $join) {
                $join->on('t.user_id', 'cpu.user_id')
                    ->where('t.client_project_id', DB::raw('cpu.client_project_id'));
            })
            ->leftJoin('client_projects as cp', function (JoinClause $join) {
                $join->on('t.client_project_id', 'cp.id');
            })
            ->leftJoin('timesheet_approval as ta', function (JoinClause $join) {
                $join->whereIn('ta.approval_id', [DB::raw('u.report_to_id'), $this->request->decoded->get('id')])
                    ->where('t.id', DB::raw('ta.timesheet_id'));
            })
            ->where(function (Builder $builder) {
                $builder->where('u.report_to_id', $this->request->decoded->get('id'))
                    ->orWhere('ta.approval_id', DB::raw('cp.project_manager_id'));
            })
            ->where(function (Builder $builder) use ($id) {
                if ($id !== null) {
                    $builder->where('u.id', $id);
                }
            })
            ->whereNull('u.deleted_at')
            ->groupBy(['u.id', 'u.first_name', 'u.last_name', 'p.name'])
            ->orderByRaw('count(ta.id) desc')
            ->get();
    }

    public function getEmployeeTimesheetByUser(string $id)
    {
        return $this->getEmployeeTimesheet($id);
    }

    public function updateEmployeeTimesheetByApproval(string $id)
    {
        $user = DB::transaction(function () use ($id) {
            // get all approval
            $approvals = DB::query()
                ->from('timesheet_approval')
                ->select([
                    'id',
                    'sort'
                ])
                ->where('timesheet_id', $this->request->timesheetId)
                ->orderBy('sort')
                ->get();

            // then update status by timesheet approval id
            DB::table('timesheet_approval')
                ->where('id', $id)
                ->update([
                    'status' => $this->request->status,
                    'updated_at' => now()
                ]);


            $insertedLog = array();

            array_push($insertedLog, [
                'id' => Str::ulid(),
                'user_id' => $this->request->decoded->get('id'),
                'timesheet_id' => $this->request->timesheetId,
                'status' => $this->request->status,
                'notes' => $this->request->notes,
                'executed_at' => now(),
                'created_at' => now()
            ]);

            if ($this->request->status === TimesheetApprovalStatus::APPROVED->value) {
                if ($approvals->last()->id === $id) {
                    // if id is the last approval, then set timesheet to completed
                    DB::table('timesheets')
                        ->where('id', $this->request->timesheetId)
                        ->update([
                            'status' => TimesheetStatus::COMPLETED->value
                        ]);

                    array_push($insertedLog, [
                        'id' => Str::ulid(),
                        'user_id' => $this->request->decoded->get('id'),
                        'timesheet_id' => $this->request->timesheetId,
                        'status' => TimesheetApprovalStatus::COMPLETED->value,
                        'notes' => null,
                        'executed_at' => now(),
                        'created_at' => now()
                    ]);
                } else {
                    // else it will continue to next approval
                    DB::table('timesheet_approval')
                        ->where('sort', $approvals->where('sort', $approvals->where('id', $id)->first()->sort)->value('sort') + 1)
                        ->where('timesheet_id', $this->request->timesheetId)
                        ->update([
                            'status' => TimesheetApprovalStatus::PENDING->value,
                            'updated_at' => now()
                        ]);
                }
            } else if ($this->request->status === TimesheetApprovalStatus::REVISED->value) {
                DB::table('timesheets')
                    ->where('id', $this->request->timesheetId)
                    ->update([
                        'status' => TimesheetStatus::REVISED->value
                    ]);
            } else if ($this->request->status === TimesheetApprovalStatus::REJECTED->value) {
                DB::table('timesheets')
                    ->where('id', $this->request->timesheetId)
                    ->update([
                        'status' => TimesheetStatus::REJECTED->value
                    ]);
            }

            DB::table('timesheet_approval_log')
                ->insert($insertedLog);

            return DB::table('timesheets')
                ->select('user_id as id')
                ->where('id', $this->request->timesheetId)
                ->first();
        }, 3);

        return $this->getEmployeeTimesheet($user->id);
    }

    private function createTimesheetApprovals(string $id)
    {
        $approvals = array();

        if ($this->request->clientProjectId !== null) {
            $projectManager = DB::query()
                ->from('client_projects as cp')
                ->select([
                    'cp.project_manager_id as approval_id',
                    'cp.is_requires_project_manager_approval as is_requires_project_manager_approval'
                ])
                ->where('cp.id', $this->request->clientProjectId)
                ->where('cp.project_manager_id', '<>', $this->request->decoded->get('id'))
                ->first();

            if ($projectManager !== null && $projectManager?->is_requires_project_manager_approval) {
                array_push($approvals, [
                    'id' => Str::ulid(),
                    'approval_id' => $projectManager->approval_id,
                    'timesheet_id' => $id,
                    'status' => TimesheetApprovalStatus::PENDING->value,
                    'sort' => 1,
                    'created_at' => now()
                ]);
            }
        }

        $superior = DB::query()
            ->from('users as u')
            ->select([
                'u.report_to_id as approval_id'
            ])
            ->where('u.id', $this->request->decoded->get('id'))
            ->where(function (Builder $builder) use ($approvals) {
                if (count($approvals) > 0) {
                    $projectManager = $approvals[0];
                    $builder->where('u.report_to_id', '<>', $projectManager['approval_id']);
                }
            })
            ->whereNotNull('u.report_to_id')
            ->whereNull('u.deleted_at')
            ->first();

        if ($superior !== null) {
            array_push($approvals, [
                'id' => Str::ulid(),
                'approval_id' => $superior->approval_id,
                'timesheet_id' => $id,
                'status' => count($approvals) > 0 ? TimesheetApprovalStatus::WAITING->value : TimesheetApprovalStatus::PENDING->value,
                'sort' => count($approvals) + 1,
                'created_at' => now()
            ]);
        }

        DB::table('timesheet_approval')
            ->insert($approvals);

        if (count($approvals) === 0) {
            DB::table('timesheets')
                ->where('id', $id)
                ->update([
                    'status' => TimesheetStatus::COMPLETED->value,
                    'updated_at' => now()
                ]);

            return true;
        }

        return false;
    }

    public function timesheetConfiguration()
    {
        return DB::query()
            ->from('organizations')
            ->select([
                'work_start_at',
                'work_end_at',
            ])
            ->where('id', $this->request->decoded->get('organization')?->get('id'))
            ->whereNull('deleted_at')
            ->first();
    }
}
