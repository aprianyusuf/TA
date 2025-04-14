import { DELETE, GET, POST, PUT } from "@/configs/api";

export default {
	getAll: (params) => GET({ path: `/project-management/clients`, params }),
	create: (payload) =>
		POST({ path: `/project-management/clients/create`, payload }),
	update: ({ id, ...payload }) =>
		PUT({ path: `/project-management/clients/update/${id}`, payload }),
	show: ({ id }) => GET({ path: `/project-management/clients/${id}` }),
	delete: ({ id }) => DELETE({ path: `/project-management/clients/${id}` }),

	getClientProjectAll: ({ client, ...params }) =>
		GET({ path: `/project-management/clients/${client}/projects`, params }),
	createClientProject: ({ client, ...payload }) =>
		POST({
			path: `/project-management/clients/${client}/projects/create`,
			payload,
		}),
	updateClientProject: ({ client, id, ...payload }) =>
		PUT({
			path: `/project-management/clients/${client}/projects/update/${id}`,
			payload,
		}),
	showClientProject: ({ client, id }) =>
		GET({ path: `/project-management/clients/${client}/projects/${id}` }),
	deleteClientProject: ({ client, id }) =>
		DELETE({ path: `/project-management/clients/${client}/projects/${id}` }),

	getClientProjectUserAll: ({ client, id, ...params }) =>
		GET({
			path: `/project-management/clients/${client}/projects/${id}/users`,
			params,
		}),
	createClientProjectUser: ({ client, id, ...payload }) =>
		POST({
			path: `/project-management/clients/${client}/projects/${id}/users/create`,
			payload,
		}),
	showClientProjectUser: ({ client, project, id }) =>
		GET({
			path: `/project-management/clients/${client}/projects/${project}/users/${id}`,
		}),
	updateClientProjectUser: ({ client, project, id, ...payload }) =>
		PUT({
			path: `/project-management/clients/${client}/projects/${project}/users/update/${id}`,
			payload,
		}),
	deleteClientProjectUser: ({ client, project, id }) =>
		DELETE({
			path: `/project-management/clients/${client}/projects/${project}/users/${id}`,
		}),

	getEmployeeProject: (params) =>
		GET({
			path: `/project-management/employee-project`,
			params,
		}),
};
