import React from "react";

import { ChevronRight, SquareKanban } from "lucide-react";
import { Link } from "react-router-dom";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./ui/Collapsible";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "./ui/Sidebar";

const SidebarProject = () => {
	return (
		<SidebarGroup>
			<SidebarMenu>
				<Collapsible
					key={"Overview"}
					asChild
					defaultOpen={true}
					className="group/collapsible"
				>
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							<SidebarMenuButton tooltip={"Master data"}>
								<SquareKanban />
								<span>Overview</span>
								<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</SidebarMenuButton>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarMenuSub>
								<SidebarMenuSubItem key={1}>
									<SidebarMenuSubButton asChild>
										<Link to={"/"}>{"a"}</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							</SidebarMenuSub>
						</CollapsibleContent>
					</SidebarMenuItem>
				</Collapsible>
			</SidebarMenu>
		</SidebarGroup>
	);
};

export default SidebarProject;
