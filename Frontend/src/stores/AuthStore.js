import { createJSONStorage, persist } from "zustand/middleware";

const initialState = {
	user: null,
	token: null,
	refreshToken: null,
};

const AuthStore = persist(
	(set) => ({
		...initialState,

		setAuthStore: (key, data) => {
			set({ [key]: data });
		},

		login: (data) => {
			set({
				user: data.user,
				token: data.token,
				refreshToken: data.refresh_token,
			});
		},

		logout: () => {
			set({ ...initialState });
		},
	}),
	{
		name: "Auth-Store",
		storage: createJSONStorage(() => localStorage),
	},
);

export default AuthStore;
