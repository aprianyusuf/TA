import { GET } from "@/configs/api";

export default {
	getLeaveType: (params) => GET({ path: `/leave-type`, params }),
};
