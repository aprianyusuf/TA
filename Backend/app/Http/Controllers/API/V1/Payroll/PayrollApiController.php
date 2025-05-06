<?php

namespace App\Http\Controllers\API\V1\Payroll;

use Illuminate\Http\Request;
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
    public function index(Request $request)
    {
        $request->validate([
            'status' => 'string|in:active,inactive',
            'code' => 'integer',
        ]);
        [$data, $count] = $this->payrollService->getData($request);

        return $this->successResponse(PayrollIndexResource::collection($data), optionalResponses: ['count' => $count]);
    }

    public function show(Request $request, string $id)
    {
        $request->validate([
            'status' => 'string|in:active,inactive',
            'code' => 'integer',
        ]);
        $data = $this->payrollService->getData($request, $id);

        return $this->successResponse(new PayrollIndexResource($data));
    }
}
