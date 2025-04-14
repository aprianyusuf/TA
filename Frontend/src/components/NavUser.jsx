import { lazy, Suspense } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/Sidebar";
import { ENABLE_CHANGE_USER } from "@/configs/env";
import { useBoundStore } from "@/stores";

import { Spinner } from "./atoms/Spinner";

const ChangeUser = lazy(() => import("./organisms/ChangeUser"));

export function NavUser() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { user, logout } = useBoundStore((s) => s);
	const { isMobile } = useSidebar();

	const handleLogout = () => {
		queryClient.clear();
		logout();
		navigate("/login", {
			replace: true,
		});
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="rounded-lg">
									{user?.first_name?.[0]?.concat(user?.last_name?.[0])}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">
									{user?.first_name?.concat(user?.last_name)}
								</span>
								<span className="truncate text-xs">{user?.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarFallback className="rounded-lg">
										{user?.first_name?.[0]?.concat(user?.last_name?.[0])}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user?.first_name?.concat(" ")?.concat(user?.last_name)}
									</span>
									<span className="truncate text-xs">{user?.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{ENABLE_CHANGE_USER ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<DropdownMenuItem className="gap-4 hover:cursor-pointer hover:bg-slate-200">
										<User className="size-5" />
										Change User
									</DropdownMenuItem>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-44 min-w-56 rounded-lg"
									side={"right"}
									align="end"
									sideOffset={4}
								>
									<Suspense
										fallback={
											<div className="flex h-32 w-44 items-center justify-center">
												<Spinner />
											</div>
										}
									>
										<ChangeUser />
									</Suspense>
								</DropdownMenuContent>
							</DropdownMenu>
						) : null}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleLogout}
							className="gap-4 hover:cursor-pointer hover:bg-slate-200"
						>
							<LogOut className="size-5" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
