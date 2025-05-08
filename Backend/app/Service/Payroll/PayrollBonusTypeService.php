<?php
namespace App\Service\Payroll;

use App\Utils\Enums\PayrollBonusTypeEnum;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PayrollBonusTypeService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function getData(Request $request)
    {
        $auth = $request->decoded;

        $query = DB::table('payroll_bonus_types as pbt')
            ->join('organizations as o', 'o.id', '=', 'pbt.organization_id')
            ->when($request->get('organization_id'), function ($query) use ($request) {
                $query->where('pbt.organization_id', $request->get('organization_id'));
            })
            ->select([
                'pbt.id',
                'pbt.name',
                'pbt.description',
                'pbt.percentage',
                'pbt.value',
                'pbt.value_fixed',
                'pbt.is_paid_by_organization',
                'pbt.currency',
            ]);

        $count = $query->count('pbt.id');

        return [$query->get(), $count];
    }
}
