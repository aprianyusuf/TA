import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
	getAll: (params) => GET({ path: `/foundation/positions`, params }),
	create: (payload) => POST({ path: `/foundation/positions/create`, payload }),
	getPermission: ({ id }) =>
		GET({ path: `/foundation/positions/${id}/permissions` }),
	update: ({ id, ...payload }) =>
		PUT({ path: `/foundation/positions/update/${id}`, payload }),
	show: ({ id }) => GET({ path: `/foundation/positions/${id}` }),
	delete: ({ id }) => DELETE({ path: `/foundation/positions/${id}` }),
};
