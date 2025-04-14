import axios from "axios";
import { jwtDecode } from "jwt-decode";
import isNil from "lodash/isNil";
import isObject from "lodash/isObject";
import omitBy from "lodash/omitBy";
import { toast } from "react-toastify";

import { API } from "@/configs/env";
import { isNullOrEmpty, removeNullUndefinedObject } from "@/services/helper";
import { useBoundStore } from "@/stores";

import { RESPONSE_CODE } from "./constant";

const request = axios.create({
	timeout: 30000,
});

request.interceptors.response.use(
	(response) => response,
	(error) => {
		throw error;
	},
);

async function refreshTokenWithRetry({ retries = 3, refreshToken }) {
	let attempt = 0;

	while (attempt < retries) {
		try {
			const refreshedTokenResponse = await fetch(
				`${API.replace("/v1", "")}/auth/refresh-token`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						refresh_token: refreshToken,
						timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					}),
				},
			);

			if (!refreshedTokenResponse.ok) {
				if (
					[
						RESPONSE_CODE.BAD_REQUEST,
						RESPONSE_CODE.UNAUTHENTICATED,
						RESPONSE_CODE.UNAUTHORIZED,
						RESPONSE_CODE.NOT_FOUND,
						RESPONSE_CODE.UNPROCESSABLE_ENTITY,
					].includes(refreshedTokenResponse.status)
				) {
					toast.error("Session Expired", {
						autoClose: 1500,
						hideProgressBar: true,
						onClose: () => {
							useBoundStore.getState()?.logout();

							toast.warn("Redirected to login", {
								hideProgressBar: true,
								autoClose: 1000,
							});
						},
					});
					return null;
				}

				throw new Error("Failed to refresh token");
			}

			const refreshedToken = await refreshedTokenResponse.json();

			useBoundStore.getState()?.login(refreshedToken?.data);
			return refreshedToken?.data?.token;
		} catch (error) {
			attempt += 1;

			if (attempt >= retries) {
				throw error;
			}
		}
	}
}

export const getValidToken = async () => {
	const sub = useBoundStore.subscribe((state) => state.token);
	const token = useBoundStore.getState()?.token;

	if (!token) {
		toast.error("Token not found", {
			hideProgressBar: true,
			onClose: () => {
				useBoundStore.getState()?.logout();

				toast.warn("Redirected to login", {
					hideProgressBar: true,
					autoClose: 1000,
				});
			},
		});
	}
	const decoded = jwtDecode(token);
	const currentTime = Date.now() / 1000;
	if (decoded.exp > currentTime) {
		useBoundStore.setState({
			token,
		});

		sub();
		return token;
	} else {
		const refreshToken = useBoundStore.getState()?.refreshToken;
		try {
			const token = await refreshTokenWithRetry({
				refreshToken,
			});

			sub();
			return token;
		} catch (error) {
			toast.error(error.message, {
				autoClose: 1500,
				onClose: () => {
					useBoundStore.getState()?.logout();

					sub();
					toast.warn("Redirected to login", {
						hideProgressBar: true,
						autoClose: 1000,
					});
				},
			});
		}
	}
};

export const GET = async ({
	path,
	params = {},
	domain = API,
	responseType = "json",
}) => {
	const token = await getValidToken();
	const headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};
	let url = domain.concat(path);

	return new Promise((resolve, reject) => {
		request
			.get(url, {
				headers,
				params:
					isObject(params) && !isNullOrEmpty(params)
						? removeNullUndefinedObject(params)
						: undefined,
				responseType,
			})
			.then((response) => {
				return resolve(response.data);
			})
			.catch((err) => {
				return reject(err?.response?.data);
			});
	});
};

export const POST = async ({
	path,
	payload = {},
	params = {},
	domain = API,
}) => {
	let token = "";

	if (path !== "/auth/login") {
		token = await getValidToken();
	}

	const headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};

	let url = domain.concat(path);

	return new Promise((resolve, reject) => {
		request
			.post(url, payload, {
				headers,
				params:
					isObject(params) && !isNullOrEmpty(params)
						? omitBy(params, isNil)
						: undefined,
			})
			.then((response) => {
				return resolve(response.data);
			})
			.catch((err) => {
				return reject(err?.response?.data);
			});
	});
};

export const PUT = async ({ path, payload, params = {}, domain = API }) => {
	const token = await getValidToken();
	const headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};

	let url = domain.concat(path);

	return new Promise((resolve, reject) => {
		request
			.put(url, payload, {
				headers,
				params: isObject(params) && !isNullOrEmpty(params) ? params : undefined,
			})
			.then((response) => {
				return resolve(response.data);
			})
			.catch((err) => {
				return reject(err?.response?.data);
			});
	});
};

export const DELETE = async ({
	path,
	payload = {},
	params = {},
	domain = API,
}) => {
	const token = await getValidToken();
	const headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};

	let url = domain.concat(path);

	return new Promise((resolve, reject) => {
		request
			.delete(url, {
				headers,
				data: payload,
				params: isObject(params) && !isNullOrEmpty(params) ? params : undefined,
			})
			.then((response) => {
				return resolve(response.data);
			})
			.catch((err) => {
				return reject(err?.response?.data);
			});
	});
};

export const UPLOAD_S3 = async ({ url, file }) => {
	return new Promise((resolve, reject) => {
		axios
			.put(url, file, {
				headers: {
					Accept: "application/json",
					"Content-Type": file.type,
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Allow-Origin": "*",
				},
			})
			.then((response) => {
				if (response.status === 200) {
					return resolve(response.data);
				} else {
					return reject(response.data);
				}
			})
			.catch((err) => {
				return reject(err);
			});
	});
};
