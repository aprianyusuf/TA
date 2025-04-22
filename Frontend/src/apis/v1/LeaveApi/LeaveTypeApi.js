import { GET } from "@/configs/api";

export default {
	getLeaveRequest: (params) => GET({ path: `/leave-type`, params }),
};
