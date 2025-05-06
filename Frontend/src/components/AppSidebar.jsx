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
import logo from '@/assets/logo_msp.png';

export function AppSidebar({ ...props }) {
	return (
		<Sidebar collapsible="offcanvas" variant="sidebar" {...props}>
			<SidebarHeader className="flex justify-center items-center px-2 pb-0 pt-2">
				<img
					alt="logo-organization"
					src={logo}
					className="w-40 object-contain"
				/>
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
