<?php

namespace App\Http\Controllers\API\V1\ProjectManagement;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectManagement\SidebarUserProject;
use App\Service\ProjectManagement\ProjectService;
use Illuminate\Http\Request;

class ProjectApiController extends Controller
{
    public function __construct(
        protected Request $request,
        protected ProjectService $projectService
    ) {}

    /**
     * Get User Sidebar Project
     */
    public function getSidebarProject() {
        [$data, $has_more_project] = $this->projectService->getSidebarProject();

        /**
         * @status 200
         * @body array{status: string, code: int, data: SidebarUserProject[]}
         */
        return $this->successResponse(data: SidebarUserProject::collection($data), optionalResponses: ['has_more_project' => $has_more_project]);
    }
}
