<?php

namespace App\Service\Foundation;

use App\Http\Requests\Foundation\Organization\UpdateOrganizationRequest;
use App\Http\Resources\Foundation\OrganizationResource;
use App\Http\Resources\Foundation\PermissionResource;
use App\Models\Foundation\Employee;
use App\Models\Foundation\Organization;
use App\Models\User;
use App\Traits\Services\DALTrait;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrganizationService
{
    use DALTrait;

    public function get(Request $request): array
    {
        $query = DB::query()
            ->from('organizations')
            ->select('*')
            ->where('deleted_at', null);

        if (collect($request->get('filters'))?->where('column', 'name')->count()) {
            $filter = collect(collect($request->get('filters'))->where('column', 'name')->first());
            $condition = $filter->get('condition') === 'equals' ? '=' : 'LIKE';
            $value = $condition === '=' ? $filter->get('value') : "%{$filter->get('value')}%";

            $query = $query->whereRaw("name {$condition} ?", [$value]);
        }

        if (collect($request->get('filters'))?->where('column', 'domain')->count()) {
            $filter = collect(collect($request->get('filters'))->where('column', 'domain')->first());
            $condition = $filter->get('condition') === 'equals' ? '=' : 'LIKE';
            $value = $condition === '=' ? $filter->get('value') : "%{$filter->get('value')}%";

            $query = $query->whereRaw("domain {$condition} ?", [$value]);
        }

        $count = $query->count('id');

        if ($request->get('orderColumn')) {
            $query = $query->orderBy(DB::raw($request->get('orderColumn')), $$request->get('orderBy') ?? "asc");
        }

        $query = $query->skip(($request->get('page', 1) - 1) * $request->get('size', 10))->limit($request->get('size', 10));

        $data = $query->get();

        return [OrganizationResource::collection($data), $count];
    }

    public function createOrganization(Request $request): Collection
    {
        return DB::transaction(function () use ($request) {
            $timezone = new DateTimeZone($request->timezone);
            $datetime = new DateTime('now', $timezone);

            $offsetInHours = $timezone->getOffset($datetime) / 60 / 60;

            $organization = Organization::query()
                ->create([
                    'id'                            => Str::ulid(),
                    'name'                          => $request->name,
                    'domain'                        => $request->domain,
                    'timezone'                      => $request->timezone,
                    'timezone_offset'               => $offsetInHours,
                    'cut_off_timesheet_start_day'   => $request->cutOffTimesheetStartDay,
                    'cut_off_timesheet_end_day'     => $request->cutOffTimesheetEndDay,
                    'work_start_at'                 => $request->workStartAt,
                    'work_end_at'                   => $request->workEndAt,
                    'address'                       => $request->address,
                    'created_by'                    => $request->decoded->get('name'),
                    'created_at'                    => now()
                ]);

            $organization_permission = DB::table('permissions')
                ->where('module_id', '<>', 1)
                ->get()
                ->transform(fn($v) => [
                    'organization_id' => $organization->id,
                    'permission_id' => $v->id
                ])
                ->toArray();

            DB::table('organization_permission')
                ->insert($organization_permission);

            $user = User::query()->create([
                'first_name' => 'Admin',
                'last_name' => $organization->name,
                'email' => 'admin@' . $request->domain,
                'password' => Hash::make('password'),
                'organization_id' => $organization->id,
                'is_admin_organization' => true
            ]);

            $employee = Employee::query()->create([
                'id' => Str::ulid(),
                'user_id' => $user->id,
                'employee_id' => fake()->bothify('ID/???/######'),
                'marital' => '',
                'religion' => '',
                'birth_at' => now()->toDateString(),
                'hired_start_at' => now()->toDateString(),
                'identity_number' => '',
            ]);

            return collect($organization)->merge([
                'user' => $user,
                'employee' => $employee
            ]);
        });
    }

    public function permissions(Request $request): array
    {
        $query = DB::query()
            ->from('organization_permission as po')
            ->select([
                'p.id as id',
                'p.code as code',
                'p.name as name',
                'p.module_id as module',
                'm.name as module_name',
                'p.description as description',
            ])
            ->join('permissions as p', 'po.permission_id', '=', 'p.id')
            ->join('modules as m', 'p.module_id', '=', 'm.id')
            ->where('po.organization_id', '=', $request->decoded->get('organization')?->get('id'))
            ->whereNotIn('m.name', ['System', 'Project Management']);

        if ($request->search) {
            $query->whereRaw("p.name LIKE ?", ["%{$request->search}%"]);
        }

        $query = $query->orderBy('p.id')->get();
        Log::info('create employee permissions:', [$query]);

        return [PermissionResource::collection($query), $query->count()];
    }

    public function showOrganization(mixed $id): ?Organization
    {
        return Organization::query()->where("id", $id)->first();
    }

    public function updateOrganization(UpdateOrganizationRequest $updateOrganizationRequest, Organization $organization): Organization
    {
        $timezone = new DateTimeZone($updateOrganizationRequest->timezone);
        $datetime = new DateTime('now', $timezone);

        $offsetInHours = $timezone->getOffset($datetime) / 60 / 60;

        $organization->address = $updateOrganizationRequest->address;
        $organization->timezone = $updateOrganizationRequest->timezone;
        $organization->timezone_offset = $offsetInHours;
        $organization->cut_off_timesheet_start_day = $updateOrganizationRequest->cutOffTimesheetStartDay;
        $organization->cut_off_timesheet_end_day = $updateOrganizationRequest->cutOffTimesheetEndDay;
        $organization->work_start_at = $updateOrganizationRequest->workStartAt;
        $organization->work_end_at = $updateOrganizationRequest->workEndAt;
        $organization->updated_at = now();

        $organization->save();

        return $organization;
    }

    public function deleteOrganization(Organization $organization)
    {
        $organization->deleted_at = now();
        $organization->save();
    }
}
