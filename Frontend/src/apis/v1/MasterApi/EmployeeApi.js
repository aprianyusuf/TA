import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
	getAll: (params) => GET({ path: `/foundation/employees`, params }),
	getEmployeeByPosition: (params) =>
		GET({ path: `/foundation/employees/by-position`, params }),
	hierarchy: (params) =>
		GET({ path: `/foundation/employees/hierarchy`, params }),
	create: (payload) => POST({ path: `/foundation/employees/create`, payload }),
	update: ({ id, ...payload }) =>
		PUT({ path: `/foundation/employees/update/${id}`, payload }),
	show: ({ id }) => GET({ path: `/foundation/employees/${id}` }),
	delete: ({ id }) => DELETE({ path: `/foundation/employees/${id}` }),
};
