import { jwtDecode } from "jwt-decode";
import {
	CalendarClock,
	CalendarRange,
	ChevronRight,
	Database,
	FileBox,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/Sidebar";
import {
	ROUTE_LEAVE,
	ROUTE_MASTER,
	ROUTE_PAYROLL,
	ROUTE_PROJECT_MANAGEMENT,
	ROUTE_TIMESHEET,
} from "@/routes";
import { useBoundStore } from "@/stores";

export function NavMain() {
	const { token } = useBoundStore((s) => s);

	if (!token) {
		return null;
	}

	const decoded = jwtDecode(token);
	const permission = decoded.user.permission;

	return (
		<SidebarGroup>
			<SidebarMenu>
				{ROUTE_MASTER.filter((v) => permission.includes(v.menu) && v.isNavbar)
					.length > 0 ? (
					<Collapsible
						key={"Master-Data"}
						asChild
						defaultOpen={true}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={"Master data"}>
									<Database />
									<span>Master Data</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{ROUTE_MASTER.filter(
										(v) => permission.includes(v.menu) && v.isNavbar,
									).map(({ title, fullPath }) => (
										<SidebarMenuSubItem key={title}>
											<SidebarMenuSubButton asChild>
												<Link to={fullPath}>{title}</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				) : null}
				{ROUTE_LEAVE.filter(
					(v) => (permission.includes(v.menu) || v.menu === true) && v.isNavbar,
				).length > 0 ? (
					<Collapsible
						key={"Leave"}
						asChild
						defaultOpen={true}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={"Leave"}>
									<CalendarClock />
									<span>Leave</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{ROUTE_LEAVE.filter(
										(v) =>
											(permission.includes(v.menu) || v.menu === true) &&
											v.isNavbar,
									).map(({ title, fullPath }) => (
										<SidebarMenuSubItem key={title}>
											<SidebarMenuSubButton asChild>
												<Link to={fullPath}>{title}</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				) : null}
				{/* {ROUTE_TIMESHEET.filter(
					(v) => (permission.includes(v.menu) || v.menu === true) && v.isNavbar,
				).length > 0 ? (
					<Collapsible
						key={"Timesheet"}
						asChild
						defaultOpen={true}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={"Timesheet"}>
									<CalendarRange />
									<span>Timesheet</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{ROUTE_TIMESHEET.filter(
										(v) =>
											(permission.includes(v.menu) || v.menu === true) &&
											v.isNavbar,
									).map(({ title, fullPath }) => (
										<SidebarMenuSubItem key={title}>
											<SidebarMenuSubButton asChild>
												<Link to={fullPath}>{title}</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				) : null}
				{ROUTE_PROJECT_MANAGEMENT.filter(
					(v) => (permission.includes(v.menu) || v.menu === true) && v.isNavbar,
				).length > 0 ? (
					<Collapsible
						key={"Project Management"}
						asChild
						defaultOpen={true}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={"Project Management"}>
									<FileBox />
									<span>Project Management</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{ROUTE_PROJECT_MANAGEMENT.filter(
										(v) =>
											(permission.includes(v.menu) || v.menu === true) &&
											v.isNavbar,
									).map(({ title, fullPath }) => (
										<SidebarMenuSubItem key={title}>
											<SidebarMenuSubButton asChild>
												<Link to={fullPath}>{title}</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				) : null} */}
				{ROUTE_PAYROLL.filter(
					(v) => (permission.includes(v.menu) || v.menu === true) && v.isNavbar,
				).length > 0 ? (
					<Collapsible
						key={"Payroll"}
						asChild
						defaultOpen={true}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={"Payroll"}>
									<FileBox />
									<span>Payroll</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{ROUTE_PAYROLL.filter(
										(v) =>
											(permission.includes(v.menu) || v.menu === true) &&
											v.isNavbar,
									).map(({ title, fullPath }) => (
										<SidebarMenuSubItem key={title}>
											<SidebarMenuSubButton asChild>
												<Link to={fullPath}>{title}</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				) : null}
			</SidebarMenu>
		</SidebarGroup>
	);
}
