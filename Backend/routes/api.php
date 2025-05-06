<?php

use App\Http\Controllers\API\V1\Authentication\AuthenticationApiController;
use App\Http\Controllers\API\V1\Foundation\EmployeeApiController;
use App\Http\Controllers\API\V1\Foundation\FileApiController;
use App\Http\Controllers\API\V1\Foundation\OrganizationApiController;
use App\Http\Controllers\API\V1\Foundation\PositionApiController;
use App\Http\Controllers\API\V1\Leave\AttendanceApiController;
use App\Http\Controllers\API\V1\Leave\LeaveRequestApiController;
use App\Http\Controllers\API\V1\Leave\LeaveTypeApiController;
use App\Http\Controllers\API\V1\Payroll\PayrollApiController;
use App\Http\Controllers\API\V1\Payroll\PayrollPeriodApiController;
use App\Http\Controllers\API\V1\ProjectManagement\ClientApiController;
use App\Http\Controllers\API\V1\ProjectManagement\ProjectApiController;
use App\Http\Controllers\API\V1\Timesheet\EmployeeTimesheetApiController;
use App\Middleware\AuthenticationMiddleware;
use App\Middleware\EnsureUserHasPermission;
use App\Middleware\PermissionConstant;
use Dedoc\Scramble\Generator;
use Dedoc\Scramble\Scramble;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')
    ->controller(AuthenticationApiController::class)->group(function () {
    Route::post('/login', 'login')
        ->withoutMiddleware(AuthenticationMiddleware::class);
    Route::post('/refresh-token', 'refreshToken')
        ->withoutMiddleware(AuthenticationMiddleware::class);

    if (config('app.enable_change_user')) {
        Route::post('/change-user', 'changeUser');
    }
});

Route::prefix('v1')->group(function () {
    Route::prefix('foundation')
        ->group(function () {
            Route::controller(OrganizationApiController::class)
                ->prefix('organizations')
                ->group(function () {
                    Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_ORGANIZATION->value)[0]);
                    Route::get('/permissions', 'permissions')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::VIEW_ORGANIZATION_PERMISSION->value)[0]);
                    Route::post('/create', 'store')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::ADD_ORGANIZATION->value)[0]);
                    Route::put('/update/{id}', 'update')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::EDIT_ORGANIZATION->value)[0]);

                    Route::get('/{id}', 'show')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_ORGANIZATION->value)[0]);
                    Route::delete('/{id}', 'delete')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::DELETE_ORGANIZATION->value)[0]);
                });

            Route::controller(EmployeeApiController::class)
                ->prefix('employees')
                ->group(function () {
                    Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_EMPLOYEE->value)[0]);
                    Route::get('/by-position', 'employeeByPosition')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_EMPLOYEE->value)[0]);
                    Route::get('/hierarchy', 'hierarchy')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_EMPLOYEE->value)[0]);
                    Route::post('/create', 'store')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::ADD_EMPLOYEE->value)[0]);
                    Route::put('/update/{id}', 'update')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::EDIT_EMPLOYEE->value)[0]);

                    Route::get('/{id}', 'show')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_EMPLOYEE->value)[0]);
                    Route::delete('/{id}', 'delete')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::DELETE_EMPLOYEE->value)[0]);
                });

            Route::controller(PositionApiController::class)
                ->prefix('positions')
                ->group(function () {
                    Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_POSITION->value)[0]);
                    Route::get('/{id}/permissions', 'permissions')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_POSITION->value)[0]);
                    Route::post('/create', 'store')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::ADD_POSITION->value)[0]);
                    Route::put('/update/{id}', 'update')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::EDIT_POSITION->value)[0]);

                    Route::get('/{id}', 'show')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_POSITION->value)[0]);
                    Route::delete('/{id}', 'delete')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::DELETE_POSITION->value)[0]);
                });

            Route::controller(FileApiController::class)
                ->prefix('file')
                ->group(function () {
                    Route::post('/upload', 'upload');
                    Route::get('/', 'show');
                });
        });

    Route::prefix('leave')
        ->group(function () {
            Route::controller(AttendanceApiController::class)
                ->prefix('attendance')
                ->group(function () {
                    Route::prefix('clock-in')
                        ->group(function () {
                            Route::get('/today', 'clockInToday');
                            Route::post('/today', 'postClockInToday');
                        });
                });
        });

    Route::prefix('leave-request')
        ->controller(LeaveRequestApiController::class)
        ->group(function () {
            Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_LEAVE_REQUEST->value)[0]);
            Route::post('/create', 'store')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::ADD_LEAVE_REQUEST->value)[0]);
            Route::put('/{id}/approve', 'approve')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::EDIT_LEAVE_REQUEST->value)[0]);
            Route::put('/{id}/reject', 'reject')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::EDIT_LEAVE_REQUEST->value)[0]);
        });

    Route::prefix('leave-type')
        ->controller(LeaveTypeApiController::class)
        ->group(function () {
            Route::get('/', 'index');
        });

    Route::prefix('timesheet')
        ->group(function () {
            Route::controller(EmployeeTimesheetApiController::class)
                ->prefix('employee')
                ->group(function () {
                    Route::get('/', 'getEmployeeTimesheet');
                    Route::post('/', 'addEmployeeTimesheet');
                    Route::put('/update/{id}', 'updateEmployeeTimesheet');

                    Route::prefix('superior')
                        ->group(function () {
                            Route::get('/', 'getSubordinate');
                            Route::get('/subordinate/{id}', 'getEmployeeTimesheetByUser');
                            Route::put('/subordinate/{id}', 'updateEmployeeTimesheetByApproval');
                        });

                    Route::get('/{id}', 'showEmployeeTimesheet');
                });
            Route::controller(EmployeeTimesheetApiController::class)
                ->group(function () {
                    Route::get('/configuration', 'timesheetConfiguration');
                });
        });

    Route::prefix('payroll_period')
        ->group(function () {
            Route::controller(PayrollPeriodApiController::class)
                ->group(function () {
                    Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_PAYROLL_PERIOD->value)[0]);
                    Route::prefix('{payrollPeriodId}')->group(function () {
                        Route::get('/', 'show')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_PAYROLL_PERIOD->value)[0]);
                        Route::controller(PayrollApiController::class)
                            ->prefix('payrolls')
                            ->group(function () {
                                Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_PAYROLL->value)[0]);
                                Route::get('/{payrollId}', 'show')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_PAYROLL->value)[0]);
                            });
                    });
                });
        });

    // Route::prefix('payroll')
    //     ->group(function () {
    //         Route::controller(PayrollApiController::class)
    //             ->prefix('payrolls')
    //             ->group(function () {
    //                 Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_PAYROLL->value)[0]);
    //                 Route::get('/{id}', 'show')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_PAYROLL->value)[0]);
    //             });
    //     });

    Route::prefix('project-management')
        ->group(function () {
            Route::controller(ClientApiController::class)
                ->prefix('clients')
                ->group(function () {
                    Route::get('/', 'index')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_CLIENT->value)[0]);
                    Route::post('/create', 'store')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::ADD_CLIENT->value)[0]);
                    Route::put('/update/{id}', 'update')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::EDIT_CLIENT->value)[0]);

                    Route::get('/{id}', 'show')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_CLIENT->value)[0]);
                    Route::delete('/{id}', 'delete')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::DELETE_CLIENT->value)[0]);

                    Route::prefix('{client}/projects')
                        ->group(function () {

                            Route::get('/', 'projectByClient')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::MENU_CLIENT->value)[0]);
                            Route::post('/create', 'createProjectByClient')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::ADD_CLIENT->value)[0]);
                            Route::put('/update/{id}', 'updateProjectByClient')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::EDIT_CLIENT->value)[0]);

                            Route::get('/{id}/users', 'clientProjectUser');
                            Route::post('/{id}/users/create', 'createClientProjectUser');
                            Route::put('/{project}/users/update/{id}', 'updateClientProjectUser');

                            Route::get('/{project}/users/{id}', 'showClientProjectUser');
                            Route::delete('/{project}/users/{id}', 'deleteClientProjectUser');

                            Route::get('/{id}', 'showProjectByClient')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::SHOW_CLIENT->value)[0]);
                            Route::delete('/{id}', 'deleteProjectByClient')->middleware(EnsureUserHasPermission::class . ':' . explode("|", PermissionConstant::DELETE_CLIENT->value)[0]);
                        });
                });

            Route::get('/employee-project', [ClientApiController::class, 'getEmployeeProject']);

            Route::controller(ProjectApiController::class)
                ->prefix('user')
                ->group(function () {
                    Route::get('/sidebar', 'getSidebarProject');
                });
        });

    Route::get('/docs', function (Request $request, Generator $generator) {
        if (! app()->isLocal() && $request->get('token', '') != 'development-docs') {
            return response()->json('not found');
        }

        $config = Scramble::getGeneratorConfig('default');

        return view('scramble::docs', [
            'spec'   => $generator($config),
            'config' => $config,
        ]);
    })->withoutMiddleware(AuthenticationMiddleware::class);
});

Route::any("*", function () {
    return response()->json('not found', 404);
})->withoutMiddleware(AuthenticationMiddleware::class);
