<?php
namespace App\Http\Controllers\API\V1\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Resources\Payroll\PayrollBonusTypeIndexResource;
use App\Service\Payroll\PayrollBonusTypeService;
use Illuminate\Http\Request;

class PayrollBonusTypeApiController extends Controller
{
    public function __construct(protected PayrollBonusTypeService $payrollBonusTypeService)
    {
        $this->payrollBonusTypeService = $payrollBonusTypeService;
    }
    /**
     * @group Payroll bonus type
     *
     */public function index(Request $request)
    {
        [$data, $count] = $this->payrollBonusTypeService->getData($request);

        return $this->successResponse(PayrollBonusTypeIndexResource::collection($data), optionalResponses: ['count' => $count]);
    }
}
