<?php

namespace App\Service\Foundation;

use App\Http\Resources\Foundation\PositionResource;
use App\Traits\Services\DALTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PositionService
{
    use DALTrait;

    public function get(Request $request): array
    {
        $query = DB::query()
            ->from('positions as p')
            ->select([
                'p.id as id',
                'p.name as name',
                'pp.id as parent',
                'pp.name as parent_name',
            ])
            ->join('positions as pp', 'p.position_id', '=', 'pp.id', 'left')
            ->where('p.organization_id', $request->decoded->get('organization')?->get('id'));

        if ($request->search) {
            $query->whereRaw("p.name ILIKE ?", ["%{$request->search}%"]);
        }

        $count = $query->count();

        $query = $query
            ->addSelect(DB::raw('COUNT(u.id) as user_count'))
            ->join('users as u', 'p.id', '=', 'u.position_id', 'left')
            ->groupBy('p.id', 'pp.id', 'p.name', 'pp.name')
            ->orderBy('p.id');

        if ($request->orderColumn) {
            $query = $query->orderBy(DB::raw($request->orderColumn), $request->get('orderBy', 'asc'));
        }

        $query = $query->skip(($request->get('page', 1) - 1) * $request->get('size', 10))->limit($request->get('size', 10));

        $data = $query->get();

        return [PositionResource::collection($data), $count];
    }

    public function createPosition(Request $request)
    {
        $position = DB::transaction(function () use ($request) {
            $insert = [
                'id' => Str::ulid(),
                'name' => $request->name,
                'organization_id' => $request->decoded->get('organization')?->get('id'),
                'created_at' => now()
            ];

            $positionId = Str::ulid();
            if ((bool)$request->positionId) {
                $insert = array_merge($insert, [
                    'position_id' => $request->positionId,
                    'id'    =>  $positionId,
                ]);
            }
            DB::table('positions')
                ->insertGetId($insert);

            $permissions = DB::table('permissions')
                ->whereIn('code', collect($request->permissions)->unique()->toArray())
                ->get()
                ->pluck('id')
                ->toArray();

            DB::table('permission_position')
                ->insert(collect($permissions)->transform(fn($v) => [
                    'position_id' => $positionId,
                    'permission_id' => $v
                ])->toArray());

            return DB::query()
                ->from('positions as p')
                ->select([
                    'p.id as id',
                    'p.name as name',
                    'pp.id as parent',
                    'pp.name as parent_name',
                ])
                ->join('positions as pp', 'p.position_id', '=', 'pp.id', 'left')
                ->where('p.id', $positionId)
                ->first();
        });

        return PositionResource::make($position);
    }

    public function getPositionPermissions(Request $request, Collection $position)
    {
        $permissions = DB::query()
            ->from('permission_position as pp')
            ->select([
                'p.code as code',
            ])
            ->join('permissions as p', 'pp.permission_id', '=', 'p.id')
            ->join('modules as m', 'p.module_id', '=', 'm.id')
            ->where('pp.position_id', '=', $position->get('id'))
            ->get()
            ->pluck('code');

        return collect($position)->merge([
            'permissions' => $permissions
        ]);
    }

    public function updatePosition(Request $request, string $id)
    {
        $position = DB::transaction(function () use ($request, $id) {
            $update = [
                'name' => $request->name,
                'organization_id' => $request->decoded->get('organization')?->get('id'),
                'updated_at' => now(),
                'position_id' => $request->positionId,
            ];

            DB::table('positions')
                ->where('id', $id)
                ->update($update);

            $permissions = DB::table('permissions')
                ->whereIn('code', collect($request->permissions)->unique()->toArray())
                ->get()
                ->pluck('id')
                ->toArray();

            DB::query()
                ->from('permission_position')
                ->where('position_id', $id)
                ->delete();

            DB::table('permission_position')
                ->insert(collect($permissions)->transform(fn($v) => [
                    'position_id' => $id,
                    'permission_id' => $v
                ])->toArray());

            return DB::query()
                ->from('positions as p')
                ->select([
                    'p.id as id',
                    'p.name as name',
                    'pp.id as parent',
                    'pp.name as parent_name',
                ])
                ->join('positions as pp', 'p.position_id', '=', 'pp.id', 'left')
                ->where('p.id', $id)
                ->first();
        });

        return PositionResource::make($position);
    }

    public function deletePosition(string $id)
    {
        DB::transaction(function () use ($id) {
            DB::query()
                ->from('permission_position')
                ->where('position_id', $id)
                ->delete();

            DB::table('positions')
                ->where('id', $id)
                ->delete();
        });
    }
}
