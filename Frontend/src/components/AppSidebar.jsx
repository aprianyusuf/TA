import * as React from "react";

import { Link } from "react-router-dom";

import { NavUser } from "@/components/NavUser";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/Sidebar";

import SidebarSwitcher from "./SidebarSwitcher";

export function AppSidebar({ ...props }) {
	return (
		<Sidebar collapsible="offcanvas" variant="sidebar" {...props}>
			<SidebarHeader className="px-2 pb-0 pt-2">
				<Link to={"/"}>
					<img
						alt="logo-organization"
						src="https://rootdigitaltechnology.com/images/logo/Logo-01.png"
						className="w-28 object-contain"
					/>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarSwitcher />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail className="cursor-pointer" />
		</Sidebar>
	);
}
