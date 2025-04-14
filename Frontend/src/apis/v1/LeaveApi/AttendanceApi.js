import { GET, POST } from "@/configs/api";

export default {
	getTodayClockIn: () => GET({ path: `/leave/attendance/clock-in/today` }),
	postTodayClockIn: (payload) =>
		POST({ path: `/leave/attendance/clock-in/today`, payload }),
};
