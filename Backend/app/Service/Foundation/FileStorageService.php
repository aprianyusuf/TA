<?php

namespace App\Service\Foundation;

use Aws\S3\S3Client;

class FileStorageService
{
    public function getUploadPresignedUrl(string $key, ?string $module = null)
    {
        $s3 = new S3Client([
            'region' => config('filesystems.disks.s3.region'),
            'credentials' => [
                'key' => config('filesystems.disks.s3.key'),
                'secret' => config('filesystems.disks.s3.secret'),
            ],
            'endpoint' => config('filesystems.disks.s3.endpoint')
        ]);

        $command = $s3->getCommand('PutObject', [
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => request()->decoded->get('organization')->get('domain') . "/" . request()->decoded->get('email') . "/" . $key,
            'ContentType' => $this->getMimeType($key),
            // 'Condition' => [
                // ['content-length-range', 0, 2 * 1024 * 1024]
                // ['content-length-range', 0, 1024]
            // ]
        ]);

        $presignedUrl = $s3->createPresignedRequest($command, '+5 minutes');

        return (string)$presignedUrl->getUri();
    }

    public function getPresignedUrl(string $key, ?string $module = null)
    {
        $s3 = new S3Client([
            'region' => config('filesystems.disks.s3.region'),
            'credentials' => [
                'key' => config('filesystems.disks.s3.key'),
                'secret' => config('filesystems.disks.s3.secret'),
            ],
            'endpoint' => config('filesystems.disks.s3.endpoint')
        ]);

        $command = $s3->getCommand('GetObject', [
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => request()->decoded->get('organization')->get('domain') . "/" . request()->decoded->get('email') . "/" . $key,
            'Delimeter' => '/'
        ]);

        $presignedUrl = $s3->createPresignedRequest($command, '+60 minutes');

        return (string)$presignedUrl->getUri();
    }

    protected function getMimeType(string $key): ?string
    {
        $mimes = collect([
            ["type" => ".txt", "value" => "text/plain"],
            ["type" => ".pdf", "value" => "application/pdf"],
            ["type" => ".doc", "value" => "application/vnd.ms-word"],
            ["type" => ".docx", "value" => "application/vnd.ms-word"],
            ["type" => ".xls", "value" => "application/vnd.ms-excel"],
            [
                "type" => ".xlsx",
                "value" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ],
            ["type" => ".xlsb", "value" => "application/vnd.ms-excel"],
            ["type" => ".ppt", "value" => "application/vnd.ms-powerpoint"],
            [
                "type" => ".pptx",
                "value" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ],
            ["type" => ".xlsm", "value" => "application/vnd.ms-excel.sheet.macroEnabled.12"],
            ["type" => ".png", "value" => "image/png"],
            ["type" => ".jpg", "value" => "image/jpeg"],
            ["type" => ".jpeg", "value" => "image/jpeg"],
            ["type" => ".gif", "value" => "image/gif"],
            ["type" => ".tif", "value" => "image/tiff"],
            ["type" => ".tiff", "value" => "image/tiff"],
            ["type" => ".csv", "value" => "text/csv"],
            ["type" => ".zip", "value" => "application/zip"],
            ["type" => ".msg", "value" => "application/vnd.ms-outlook"],
        ]);

        return $mimes->where("type", "." . array_reverse(explode('.', $key))[0])->value('value') || "application/octet-stream";
    }
}
