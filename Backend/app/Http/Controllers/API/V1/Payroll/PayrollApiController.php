<?php
namespace App\Http\Controllers\API\V1\Payroll;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Service\Payroll\PayrollService;
use App\Http\Resources\Payroll\PayrollIndexResource;

class PayrollApiController extends Controller
{
    protected PayrollService $payrollService;
    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }
    /**
     * List all payroll.
     *
     * @group Payroll
     *
     * @body array{status: string, code: int, data: array[], count: int}
     */
    public function index(Request $request, $payrollPeriodId=null)
    {
        if(!is_null($payrollPeriodId)) {
            if(DB::table('payroll_periods')->where('id', $payrollPeriodId)->count() == 0) {
                return $this->errorResponse('Payroll Period not found', 404);
            }
        }
        [$data, $count] = $this->payrollService->getData($request, $payrollPeriodId);

        return $this->successResponse(PayrollIndexResource::collection($data), optionalResponses: ['count' => $count]);
    }

    /**
     * Show payroll
     */

    public function show(Request $request, $payrollId, $payrollPeriodId=null )
    {
        if(DB::table('payroll_periods')->where('id', $payrollPeriodId)->count() == 0) {
            return $this->errorResponse('Payroll Period not found', 404);
        }
        if(DB::table('payrolls')->where('id', $payrollId)->count() == 0) {
            return $this->errorResponse('Payroll not found', 404);
        }
        [$data, $count] = $this->payrollService->getData($request, $payrollPeriodId, $payrollId);
        return $this->successResponse(data: $data, optionalResponses: ['count' => $count]);
    }

    public function create(Request $request, $payrollPeriodId)
    {
        if(DB::table('payroll_periods')->where('id', $payrollPeriodId)->count() == 0) {
            return $this->errorResponse('Payroll Period not found', 404);
        }
        $this->payrollService->create($request, $payrollPeriodId);
        return $this->successResponse();
    }

    public function update(Request $request, $payrollId, $payrollPeriodId)
    {
        $request->validate([
            'bonuses'=>'array',
            'bonuses.*.type_id'=>'required|string',
            'bonuses.*.percentage'=>'required|string',
            'bonuses.*.value'=>'required|numeric',
            'deductions'=>'array',
            'deductions.*.type_id'=>'required|string',
            'deductions.*.percentage'=>'required|string',
            'deductions.*.value'=>'required|numeric',
        ]);
        if(DB::table('payroll_periods')->where('id', $payrollPeriodId)->count() == 0) {
            return $this->errorResponse('Payroll Period not found', 404);
        }
        if(DB::table('payrolls')->where('id', $payrollId)->count() == 0) {
            return $this->errorResponse('Payroll not found', 404);
        }
        $this->payrollService->update($request, $payrollId, $payrollPeriodId);
        return $this->successResponse();
    }
}
