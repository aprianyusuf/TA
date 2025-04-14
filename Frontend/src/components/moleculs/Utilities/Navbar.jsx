import React from "react";

import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useBoundStore } from "@/stores";

const AuthNavigation = () => {
	const navigate = useNavigate();
	const { user, logout } = useBoundStore((s) => s);

	const handleLogout = () => {
		logout();
		navigate("/login", {
			replace: true,
		});
	};

	if (!user) {
		return (
			<Button type="button" className="rounded-md text-white" size="lg" asChild>
				<Link to={"/login"}>Masuk</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="flex items-center justify-center gap-2">
					<Avatar className="size-10 cursor-pointer border border-black/50">
						<AvatarFallback>
							{user?.first_name?.[0]?.concat(user?.last_name?.[0])}
						</AvatarFallback>
					</Avatar>
					<ChevronDown size={16} />
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40">
				<DropdownMenuLabel
					className="rounded-md p-3 hover:cursor-pointer hover:bg-accent"
					onClick={handleLogout}
				>
					Logout
				</DropdownMenuLabel>
				{/* <DropdownMenuSeparator /> */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

const Navbar = () => {
	return (
		<nav className="flex justify-between gap-4 bg-white py-2 drop-shadow-sm md:py-4 lg:px-4 lg:py-6">
			<div className="bg-primary-500 flex flex-shrink-0 items-center gap-6">
				<div className="ml-5 text-2xl font-bold text-black">
					<Link to="/" rel="noreferrer">
						Home
					</Link>
				</div>
			</div>
			<div className="hidden flex-shrink-0 items-center md:flex lg:gap-6">
				<Link to={"#"}>
					<span className="font-semibold">Link</span>
				</Link>

				<AuthNavigation />
			</div>
		</nav>
	);
};

export default Navbar;
