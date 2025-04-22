import { GET, POST, UPLOAD_S3 } from "@/configs/api";

export default {
	getPresignedUpload: (params) =>
		POST({ path: `/foundation/file/upload`, params }),
	getPresignedGet: (params) => GET({ path: `/foundation/file`, params }),
	upload: ({ url, file }) => UPLOAD_S3({ url, file }),
};
