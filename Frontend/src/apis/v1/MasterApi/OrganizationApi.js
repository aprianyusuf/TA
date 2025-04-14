import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
	getAll: (params) => GET({ path: `/foundation/organizations`, params }),
	create: (payload) =>
		POST({ path: `/foundation/organizations/create`, payload }),
	getPermission: (params) =>
		GET({ path: `/foundation/organizations/permissions`, params }),
	update: ({ id, ...payload }) =>
		PUT({ path: `/foundation/organizations/update/${id}`, payload }),
	show: ({ id }) => GET({ path: `/foundation/organizations/${id}` }),
	delete: ({ id }) => DELETE({ path: `/foundation/organizations/${id}` }),
};
