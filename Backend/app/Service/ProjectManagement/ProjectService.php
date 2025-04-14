<?php

namespace App\Service\ProjectManagement;

use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function __construct(
        protected Request $request
    ) {}

    public function getSidebarProject()
    {
        $clientProjectProjectAsUser = DB::query()
            ->from('client_project_user as cpu')
            ->select([
                'cp.id as id',
                'cp.name as name',
                'cp.color as color',
                'cpu.start_date_at as start_date_at',
                'cpu.end_date_at as end_date_at',
            ])
            ->selectRaw('false as is_project_manager')
            ->join('client_projects as cp', function (JoinClause $join) {
                $join->on('cpu.client_project_id', 'cp.id')
                    ->whereNull('cp.deleted_at');
            })
            ->where('cpu.user_id', $this->request->decoded->get('id'))
            ->whereRaw("now() BETWEEN cpu.start_date_at and cpu.end_date_at + time '23:59:59'")
            ->whereNull('cpu.deleted_at');

        $clientProjectAsProjectManager = DB::query()
            ->from('client_projects as cp')
            ->select([
                'cp.id as id',
                'cp.name as name',
                'cp.color as color',
                'cp.start_date_at as start_date_at',
                'cp.end_date_at as end_date_at',
            ])
            ->selectRaw('true as is_project_manager')
            ->where('cp.project_manager_id', $this->request->decoded->get('id'))
            ->whereRaw("now() BETWEEN cp.start_date_at and cp.end_date_at + time '23:59:59'")
            ->whereNull('cp.deleted_at')
            ->union($clientProjectProjectAsUser)
            ->get();

        return [$clientProjectAsProjectManager->slice(0, 3), $clientProjectAsProjectManager->count() > 3];
    }
}
