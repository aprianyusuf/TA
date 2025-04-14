import React from "react";

import { useLocation } from "react-router";

import { NavMain } from "./NavMain";
import { NavProjects } from "./NavProjects";
import SidebarProject from "./SidebarProject";

const SidebarSwitcher = () => {
	const { pathname } = useLocation();

	return (
		<>
			{pathname.startsWith("/projects") ? (
				<SidebarProject />
			) : (
				<>
					<NavMain />
					<NavProjects />
				</>
			)}
		</>
	);
};

export default SidebarSwitcher;
