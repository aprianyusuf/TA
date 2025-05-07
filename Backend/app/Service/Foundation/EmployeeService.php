<?php

namespace App\Service\Foundation;

use App\Http\Requests\Foundation\Employee\StoreEmployeeRequest;
use App\Models\Foundation\Employee;
use App\Models\User;
use App\Traits\Services\DALTrait;
use App\Utils\Constants\StoredProcedure;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmployeeService
{
    use DALTrait;

    public function __construct(
        protected Request $request,
    ) {}

    public function get(Request $request): array
    {
        $query = DB::query()
            ->from('users as u')
            ->select([
                'u.id as id',
                'e.employee_id as employee_id',
                'u.first_name as first_name',
                'u.last_name as last_name',
                'u.email as email',
                'e.identity_number as identity_number',
                'e.marital as marital',
                'e.religion as religion',
                'e.birth_at as birth_at',
                'e.employment_type as employment_type',
                'u.timezone as timezone',
                'u.report_to_id as report_to_id',
                'u2.first_name as superior_first_name',
                'u2.last_name as superior_last_name',
                'p.name as position',
                'p.id as position_id',
                'p2.name as superior_position',
            ])
            ->leftJoin('employees as e', function (JoinClause $join) {
                $join->on('u.id', 'e.user_id')
                    ->whereNull('e.deleted_at');
            })
            ->leftJoin('users as u2', function (JoinClause $join) {
                $join->on('u.report_to_id', 'u2.id')
                    ->whereNull('u2.deleted_at');
            })
            ->leftJoin('positions as p', function (JoinClause $join) {
                $join->on('u.position_id', 'p.id')
                    ->whereNull('p.deleted_at');
            })
            ->leftJoin('positions as p2', function (JoinClause $join) {
                $join->on('u2.position_id', 'p2.id')
                    ->whereNull('p2.deleted_at');
            })
            ->where('u.organization_id', $request->decoded->get('organization')?->get('id'))
            ->whereNull('u.deleted_at');

        if ($request->search) {
            $query->where(function (Builder $builder) use ($request) {
                $builder->whereRaw("CONCAT(u.first_name, ' ', u.last_name) LIKE ?", ["%{$request->search}%"]);
            });
        }

        $count = $query->count();

        $query = $query->orderBy($request->get('orderColumn', DB::raw('id')), $request->get('orderBy', 'asc'));

        $query = $query->skip(($request->get('page', 1) - 1) * $request->get('size', 10))->limit($request->get('size', 10));

        $query = $query->get();

        return [$query, $count];
    }

    public function hierarchy(Request $request)
    {
        return DB::query()
            ->from('users as u')
            ->select([
                'u.id as id',
                'e.employee_id as employee_id',
                'u.first_name as first_name',
                'u.last_name as last_name',
                'u.email as email',
                'e.identity_number as identity_number',
                'e.marital as marital',
                'e.religion as religion',
                'e.birth_at as birth_at',
                'e.employment_type as employment_type',
                'u.timezone as timezone',
                'u.report_to_id as report_to_id',
                'u2.first_name as superior_first_name',
                'u2.last_name as superior_last_name',
                'p.name as position',
                'p.id as position_id',
                'p2.name as superior_position',
            ])
            ->leftJoin('employees as e', function (JoinClause $join) {
                $join->on('u.id', 'e.user_id')
                    ->whereNull('e.deleted_at');
            })
            ->leftJoin('users as u2', function (JoinClause $join) {
                $join->on('u.report_to_id', 'u2.id')
                    ->whereNull('u2.deleted_at');
            })
            ->leftJoin('positions as p', function (JoinClause $join) {
                $join->on('u.position_id', 'p.id')
                    ->whereNull('p.deleted_at');
            })
            ->leftJoin('positions as p2', function (JoinClause $join) {
                $join->on('u2.position_id', 'p2.id')
                    ->whereNull('p2.deleted_at');
            })
            ->where('u.organization_id', $request->decoded->get('organization')?->get('id'))
            ->whereNull('u.deleted_at')
            ->orderBy('u.position_id')
            ->get();
    }

    public function employeeByPosition(?string $organizationId, ?string $positionId, string $search = null)
    {
        $fn = "SELECT * FROM  public.fn_get_users_position_in_hierarchy";

        $search = $search !== '' ? $search : null;

        return DB::select("{$fn}(?, ?, ?)", [$organizationId, $positionId, $search]);
    }


    //     public function employeeByPosition(?string $organizationId, ?string $positionId, string $search = null)
    // {
    //     $fn = StoredProcedure::FnGetUsersPositionInHierarchyMysql;

    //     // Kalau kosong string, ubah jadi NULL supaya SQL tidak error
    //     $search = $search !== '' ? $search : null;

    // return DB::select("select * from {$fn}(?, ?, ?)", [$organizationId, $positionId, $search]);

    // }


    public function createEmployee(StoreEmployeeRequest $storeEmployeeRequest)
    {
        return DB::transaction(function () use ($storeEmployeeRequest) {
            $user = User::query()->create([
                'first_name' => $storeEmployeeRequest->firstName,
                'last_name' => $storeEmployeeRequest->lastName,
                'email' => formatNameToInitials($storeEmployeeRequest->firstName, $storeEmployeeRequest->lastName) . '@' . $storeEmployeeRequest->decoded->get('organization')?->get('domain'),
                'password' => $storeEmployeeRequest->birthAt,
                'organization_id' => $storeEmployeeRequest->decoded->get('organization')?->get('id'),
                'position_id' => $storeEmployeeRequest->positionId,
                'report_to_id' => $storeEmployeeRequest->reportToId,
            ]);

            $employeePayload = [
                'id' => Str::ulid(),
                'user_id' => $user->id,
                'marital' => $storeEmployeeRequest->marital,
                'religion' => $storeEmployeeRequest->religion,
                'birth_at' => $storeEmployeeRequest->birthAt,
                'hired_start_at' => $storeEmployeeRequest->hiredStartAt,
                'employment_type' => $storeEmployeeRequest->employmentType,
                'identity_number' => $storeEmployeeRequest->identityNumber,
                'employee_id' => $storeEmployeeRequest->employeeId ?? collect(explode(' ', $storeEmployeeRequest->decoded->get('organization')?->get('name')))->map(fn($word) => Str::upper(Str::substr($word, 0, 1)))  // Get first letter of each word and lowercase it
                    ->implode('') . '/' . now()->format("Ym") . (str(DB::table('users')
                        ->whereYear('created_at', now()->year)
                        ->where('organization_id', $this->request->decoded->get('organization')->get('id'))
                        ->count() + 1)->padLeft(3, '0')),
                'created_at' => now()
            ];

            if ($storeEmployeeRequest->hiredEndAt != null) {
                $employeePayload = array_merge($employeePayload, [
                    'hired_end_at' => $storeEmployeeRequest->hiredEndAt
                ]);
            }

            DB::table('employees')
                ->insert($employeePayload);

            return $this->showEmployee($user->id);
        });
    }

    public function showEmployee(string $id)
    {
        $user = DB::query()
            ->from('users as u')
            ->select([
                'u.id as id',
                'e.employee_id as employee_id',
                'u.first_name as first_name',
                'u.last_name as last_name',
                'u.email as email',
                'e.identity_number as identity_number',
                'e.marital as marital',
                'e.religion as religion',
                'e.birth_at as birth_at',
                'e.hired_start_at as hired_start_at',
                'e.hired_end_at as hired_end_at',
                'e.employment_type as employment_type',
                'u.timezone as timezone',
                'u.report_to_id as report_to_id',
                'u2.first_name as superior_first_name',
                'u2.last_name as superior_last_name',
                'p.name as position',
                'p.id as position_id',
                'p2.name as superior_position',
            ])
            ->leftJoin('employees as e', function (JoinClause $join) {
                $join->on('u.id', 'e.user_id')
                    ->whereNull('e.deleted_at');
            })
            ->leftJoin('users as u2', function (JoinClause $join) {
                $join->on('u.report_to_id', 'u2.id')
                    ->whereNull('u2.deleted_at');
            })
            ->leftJoin('positions as p', function (JoinClause $join) {
                $join->on('u.position_id', 'p.id')
                    ->whereNull('p.deleted_at');
            })
            ->leftJoin('positions as p2', function (JoinClause $join) {
                $join->on('u2.position_id', 'p2.id')
                    ->whereNull('p2.deleted_at');
            })
            ->where('u.organization_id', $this->request->decoded->get('organization')?->get('id'))
            ->where('u.id', $id)
            ->whereNull('u.deleted_at')
            ->first();

        return $user;
    }

    public function update(string $id)
    {
        return DB::transaction(function () use ($id) {
            DB::table('users')
                ->where('id', $id)
                ->update([
                    'first_name' => $this->request->firstName,
                    'last_name' => $this->request->lastName,
                    'position_id' => $this->request->positionId,
                    'report_to_id' => $this->request->reportToId,
                    'updated_at' => now()
                ]);

            $employeePayload = [
                'marital' => $this->request->marital,
                'religion' => $this->request->religion,
                'birth_at' => $this->request->birthAt,
                'hired_start_at' => $this->request->hiredStartAt,
                'employment_type' => $this->request->employmentType,
                'identity_number' => $this->request->identityNumber,
                'updated_at' => now()
            ];

            if ($this->request->hiredEndAt != null) {
                $employeePayload = array_merge($employeePayload, [
                    'hired_end_at' => $this->request->hiredEndAt
                ]);
            }

            DB::table('employees')
                ->where('user_id', $id)
                ->update(array_merge(['updated_at' => now()], $employeePayload));

            return $this->showEmployee($id);
        }, 3);
    }

    public function delete(string $id)
    {
        DB::table('users')
            ->where('id', $id)
            ->update([
                'deleted_at' => now()
            ]);

        DB::table('employees')
            ->where('user_id', $id)
            ->update([
                'deleted_at' => now()
            ]);
    }
}
