import axios from "axios";
import { toast } from "react-toastify";

const instance = axios.create({
	timeout: 30000,
});

instance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error?.response?.status === 401) {
			if (error?.response?.data?.status === "UNAUTHORIZED") {
				// next
			} else {
				localStorage.clear();
				// store.dispatch({ type: 'SET_LOGOUT_SUCCESS' });
				// toast.error("Session is Expired or Invalid");
			}
		}

		if (error?.response?.status === 500) {
			toast.error(error?.response?.data?.message || "Something went wrong");
		}

		if (error?.code === "ERR_NETWORK") {
			toast.error(
				error?.message
					? error?.message + ", please check your network connection"
					: "Something went wrong",
			);
		}

		throw error;
	},
);

export default instance;
