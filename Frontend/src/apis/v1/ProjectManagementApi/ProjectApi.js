import { GET } from "@/configs/api";

export default {
	getSidebarProject: (params) =>
		GET({ path: `/project-management/user/sidebar`, params }),
};
