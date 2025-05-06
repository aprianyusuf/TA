<?php
namespace App\Http\Controllers\API\V1\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Resources\Payroll\PayrollIndexResource;
use App\Service\Payroll\PayrollService;
use Illuminate\Http\Request;

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
    public function index(Request $request, $payrollPeriodId)
    {
        [$data, $count] = $this->payrollService->getData($request, $payrollPeriodId);

        return $this->successResponse(PayrollIndexResource::collection($data), optionalResponses: ['count' => $count]);
    }

    /**
     * Show payroll
     */

    public function show(Request $request, $payrollPeriodId, $payrollId)
    {
        [$data, $count] = $this->payrollService->getData($request, $payrollPeriodId, $payrollId);
        return $this->successResponse(data: $data, optionalResponses: ['count' => $count]);

        // $data = $this->payrollService->getData($request, $id);

        // return $this->successResponse(new PayrollIndexResource($data));
    }
}
