import { useEffect } from "react";

import { ChevronLeft } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/Separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/Sidebar";
import { useBoundStore } from "@/stores";

const Template = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { token } = useBoundStore((s) => s);

	useEffect(() => {
		if (location.pathname === "/" && !token) {
			return navigate("/login", {
				replace: true,
			});
		}
	}, [location.pathname, navigate, token]);

	return (
		<>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset className="overflow-x-hidden">
					<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
						<div className="flex items-center gap-2 px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<Link to={-1}>
								<ChevronLeft className="size-6" />
							</Link>
							{/* <Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className="hidden md:block">
										<BreadcrumbLink href="#">
											Building Your Application
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbPage>Data Fetching</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb> */}
						</div>
					</header>
					<div className="flex w-full flex-1 flex-col gap-4 p-4 pt-0">
						<Outlet />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
};

export default Template;
