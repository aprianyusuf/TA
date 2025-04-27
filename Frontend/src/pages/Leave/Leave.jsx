import React, { Suspense, useEffect, useState } from "react";

import { jwtDecode } from "jwt-decode";
import { Route, Routes, useNavigate } from "react-router";

import { Spinner } from "@/components/atoms/Spinner";
import { ROUTE_LEAVE } from "@/routes";
import { useBoundStore } from "@/stores";

const Leave = () => {
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
			<Routes key={token}>
				{ROUTE_LEAVE.filter(
					(v) => v.menu === true || permission.includes(v.menu)
				).map(({ path, Component, isLazy }, key) => (
					<Route
						key={key}
						path={path}
						element={
							isLazy ? (
								<Suspense
									fallback={
										<div className="flex items-center justify-center w-full h-full">
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

export default Leave;
