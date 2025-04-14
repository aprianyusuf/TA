<?php

namespace App\Http\Controllers\API\V1\Foundation;

use App\Http\Controllers\Controller;
use App\Service\Foundation\FileStorageService;
use App\Traits\API\ApiResponseTrait;
use Illuminate\Http\Request;

class FileApiController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get Presigend URL S3 Upload File
     */
    public function upload(Request $request, FileStorageService  $fileStorageService) {
        $request->validate([
            /** @example file.png */
            'key' => ['string', 'required']
        ]);

        /**
         * @status 200
         * 
         * @body array{status: string, code: int, data: array{url: string}}
         */
        return $this->successResponse(data: ['url' => $fileStorageService->getUploadPresignedUrl($request->key)]);
    }

    /**
     * Get Presigend URL S3 Get File
     */
    public function show(Request $request, FileStorageService  $fileStorageService)
    {
        $request->validate([
            /** @example file.png */
            'key' => ['string', 'required']
        ]);

        /**
         * @status 200
         * 
         * @body array{status: string, code: int, data: array{url: string}}
         */
    return $this->successResponse(data: ['url' => $fileStorageService->getPresignedUrl($request->key)]);
    }
}
