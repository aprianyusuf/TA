import { useEffect, useState } from "react";

import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";

import { useBoundStore } from "@/stores";

const CheckAuthorization =
	({ Component, menu = [] }) =>
	() => {
		const navigate = useNavigate();
		const [permission, setPermission] = useState([]);
		// const location = useLocation();

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

		return <Component />;
	};

export default CheckAuthorization;
