<?php

namespace App\Traits\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

trait DALTrait
{
    public function queryTable(Builder $data, ?int $size, ?int $page, ?string $search, ?string $searchBy, ?string $orderColumn, ?string $orderBy): array
    {
        if ($search && $searchBy) {
            $data->whereRaw("{$searchBy} ILIKE ?", ["%{$search}%"]);
        }

        $count = $data->count();

        if ($orderColumn) {
            $data = $data->orderBy(DB::raw($orderColumn), $orderBy ?? "asc");
        }

        if ($size && $page) {
            $data = $data->skip(($page - 1) * $size)->limit($size);
        }

        $data = $data->get();

        return [$data, $count];
    }
}
