<?php
namespace App\Http\Controllers\API\V1\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Resources\Payroll\PayrollPeriodIndexResource;
use App\Service\Payroll\PayrollPeriodService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayrollPeriodApiController extends Controller
{
    /**
     * @group Payroll
     *
     */
    protected PayrollPeriodService $payrollPeriodService;

    public function __construct(PayrollPeriodService $payrollPeriodService)
    {
        $this->payrollPeriodService = $payrollPeriodService;
    }

    /**
     * List Payroll Periods
     */
    public function index(Request $request)
    {
        $request->validate(
            [
                /**
                 * @default 10
                 */
                'size' => ['int'],
                /**
                 * @default 1
                 */
                'page' => ['int'],
            ]
        );
        [$data, $count] = $this->payrollPeriodService->getData($request);
        /**
         * @status 200
         * @body array[status: string, code: int, data PayrollPeriodIndexResource[]], count: int
         */
        return $this->successResponse(data: PayrollPeriodIndexResource::collection($data), optionalResponses: ['count' => $count]);
    }

    /**
     * Show Payroll Period
     */

    public function show(Request $request, $payrollPeriodId)
    {
        [$data, $count] = $this->payrollPeriodService->getData($request, $payrollPeriodId);
        return $this->successResponse(data: $data, optionalResponses: ['count' => $count]);
    }

    /**
     * Create Payroll Period
     */

    public function store(Request $request)
    {
        $request->validate([
            /**
             * @body
             * @example 05-01-2025
             * @description Start date of the payroll period
             */
            'startAt'   => ['required'],
            /**
             * @example 05-31
             * @description End date of the payroll period
             */
            'endAt'     => ['required'],
            /**
             * @default 05-28-2025
             */
            'payrollAt' => ['required'],
            /**
             * @default 2025
             */
            'year'      => ['required', 'int'],
            /**
             * @default 5
             */
            'month'     => ['required', 'int'],
        ]);
        Log::debug('Payroll Period Store', $request->all());
        if ($data = $this->payrollPeriodService->store($request)) {
            return $this->successResponse(message: 'Payroll Period Created');
        }
    }

    /**
     * Update Payroll Period
     */
    public function update(Request $request, $payrollPeriodId)
    {
        $request->validate([
            'start_at'   => ['required', 'date'],
            'end_at'     => ['required', 'date'],
            'payroll_at' => ['required', 'date'],
            'year'       => ['required', 'int'],
            'month'      => ['required', 'int'],
        ]);

        $data = $this->payrollPeriodService->update($request, $payrollPeriodId);

        return $this->successResponse(data: new PayrollPeriodIndexResource($data));
    }

    // /**
    //  * Delete Payroll Period
    //  */

    public function destroy(Request $request, $payrollPeriodId)
    {
        if ($this->payrollPeriodService->delete($request, $payrollPeriodId)) {
            return $this->successResponse(message: 'Payroll Period Deleted');
        }

    }
}
