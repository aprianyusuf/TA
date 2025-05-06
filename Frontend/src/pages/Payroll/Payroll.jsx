import React, { Suspense, useEffect, useState } from "react";

import { jwtDecode } from "jwt-decode";
import { Route, Routes, useNavigate } from "react-router";

import { Spinner } from "@/components/atoms/Spinner";
import { ROUTE_PAYROLL } from "@/routes";
import { useBoundStore } from "@/stores";

const Payroll = () => {
	const navigate = useNavigate();
	const [permission, setPermission] = useState([]);

	const { token } = useBoundStore((s) => s);

	useEffect(() => {
		if (!token) {
			return navigate("/login", { replace: true });
		} else {
			try {
				const decoded = jwtDecode(token);
				setPermission(decoded.user.permission);
			} catch {
				/* empty */
			}
		}
	}, [token, permission.length]);

	return (
		<>
			<Routes>
				{ROUTE_PAYROLL.filter(
					(v) => permission.includes(v.menu) || v.menu === true,
				).map(({ path, Component, isLazy }, key) => (
					<Route
						key={key}
						path={path}
						element={
							isLazy ? (
								<Suspense
									fallback={
										<div className="flex h-full w-full items-center justify-center">
											<Spinner />
										</div>
									}
								>
									{" "}
									<Component />{" "}
								</Suspense>
							) : (
								<Component />
							)
						}
					/>
				))}
			</Routes>
		</>
	);
};

export default Payroll;
