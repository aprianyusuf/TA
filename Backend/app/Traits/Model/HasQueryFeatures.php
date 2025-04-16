<?php
namespace App\Traits\Model;

use Illuminate\Support\Collection;

trait HasQueryFeatures
{
    //
    public function scopeSearch($query, $search)
    {
        if (! $search || empty($this->searchable)) {
            return;
        }

        $query->where(function ($q) use ($search) {
            foreach ($this->searchable as $column) {
                $q->orWhere($column, 'like', "%{$search}%");
            }
        });
    }

    public function scopeSort($query, $sort)
    {
        if (! $sort || ! isset($sort['field']) || ! isset($sort['direction'])) {
            return;
        }

        if (property_exists($this, 'sortable') && in_array($sort['field'], $this->sortable)) {
            $query->orderBy($sort['field'], $sort['direction']);
        }
    }

    public function scopeFilter($query, $filters)
{
    if (!property_exists($this, 'filterable') || !$filters) {
        return;
    }

    if (is_array($filters)) {
        $filters = collect($filters);
    }

    if (!($filters instanceof Collection)) {
        return;
    }

    foreach ($this->filterable as $field) {
        if ($filters->has($field)) {
            $query->where($field, $filters->get($field));
        }
    }
}

    public function scopePaginateResults($query, $perPage = 15)
    {
        return $query->paginate($perPage);
    }
}
