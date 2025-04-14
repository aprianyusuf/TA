import { GET, POST, PUT } from "@/configs/api";

export default {
	getTimesheet: (params) => GET({ path: `/timesheet/employee`, params }),
	showTimesheet: ({ id }) => GET({ path: `/timesheet/employee/${id}` }),
	addTimesheet: (payload) => POST({ path: `/timesheet/employee`, payload }),
	updateTimesheet: ({ id, ...payload }) =>
		PUT({ path: `/timesheet/employee/update/${id}`, payload }),
	getSubordinates: (params) =>
		GET({ path: `/timesheet/employee/superior`, params }),
	getTimesheetByUser: ({ id, ...params }) =>
		GET({ path: `/timesheet/employee/superior/subordinate/${id}`, params }),
	approval: ({ id, ...payload }) =>
		PUT({ path: `/timesheet/employee/superior/subordinate/${id}`, payload }),

	getTimesheetConfig: (params) =>
		GET({ path: `/timesheet/configuration`, params }),
};
