import { GET, POST } from "@/configs/api";

export default {
    getLeaveRequest: (params) => GET({ path: `/leave-request`, params }),
    createLeaveRequest: (payload) =>POST({path: `/leave-request`, payload})
};