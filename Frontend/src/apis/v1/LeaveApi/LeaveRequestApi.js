import { GET, POST, PUT } from "@/configs/api";

export default {
	getLeaveRequest: (params) => GET({ path: `/leave-request`, params }),
	createLeaveRequest: (payload) =>
		POST({ path: `/leave-request/create`, payload }),
	approveLeaveRequest: ({ id, ...payload }) =>
		PUT({ path: `/leave-request/${id}/approve`, payload }),
	rejectLeaveRequest: ({ id, ...payload }) =>
		PUT({ path: `/leave-request/${id}/reject`, payload }),
};
