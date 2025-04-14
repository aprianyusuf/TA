import { MoreHorizontal, Settings } from "lucide-react";
import { Link } from "react-router-dom";

import ProjectApi from "@/apis/v1/ProjectManagementApi/ProjectApi";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/Sidebar";
import { useCustomQuery } from "@/hooks/useCustomQuery";
import { cn } from "@/libs/utils";

import { Skeleton } from "./ui/Skeleton";

export function NavProjects() {
	const { isMobile } = useSidebar();

	const { data: dataSidebarProject, isLoading: isLoadingSidebarProject } =
		useCustomQuery({
			api: ProjectApi.getSidebarProject,
			queryKey: "userSidebarProject",
		});

	if (isLoadingSidebarProject) {
		return (
			<div className="flex flex-col gap-3 px-6 py-2">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton className={"h-4 w-full"} key={i} />
				))}
			</div>
		);
	}

	if (dataSidebarProject?.data?.length === 0) {
		return null;
	}

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Projects</SidebarGroupLabel>
			<SidebarMenu>
				{dataSidebarProject?.data?.map((item) => (
					<SidebarMenuItem key={item.name}>
						<Link to={`/projects/${item.id}`}>
							<SidebarMenuButton className="items-center">
								<span
									className={cn("size-3 rounded-full")}
									style={{
										backgroundColor: item.color,
									}}
								/>
								<span aria-label="project-title">{item.name}</span>
							</SidebarMenuButton>
						</Link>
						{item.isProjectManager ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuAction showOnHover>
										<MoreHorizontal />
										<span className="sr-only">More</span>
									</SidebarMenuAction>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-48 rounded-lg"
									side={isMobile ? "bottom" : "right"}
									align={isMobile ? "end" : "start"}
								>
									<Link to={`/projects/${item.id}/settings`}>
										<DropdownMenuItem className="cursor-pointer gap-2">
											<Settings className="text-slate-500 dark:text-slate-400" />
											<span>Project Setting</span>
										</DropdownMenuItem>
									</Link>
								</DropdownMenuContent>
							</DropdownMenu>
						) : null}
					</SidebarMenuItem>
				))}
				{dataSidebarProject?.data?.hasMoreProject ? (
					<SidebarMenuItem>
						<SidebarMenuButton className="text-sidebar-foreground/70">
							<MoreHorizontal className="text-sidebar-foreground/70" />
							<span>More</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				) : null}
			</SidebarMenu>
		</SidebarGroup>
	);
}
