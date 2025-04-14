import { POST } from "@/configs/api";
import { API } from "@/configs/env";

export default {
	login: (payload) =>
		POST({ path: `/auth/login`, payload, domain: API.replace("/v1", "") }),
	changeUser: (payload) =>
		POST({
			path: `/auth/change-user`,
			payload,
			domain: API.replace("/v1", ""),
		}),
};
