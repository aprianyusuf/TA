const initialState = {};

const GlobalStore = (set, _) => ({
	...initialState,

	setGlobalStore: (key, data) => {
		set({ [key]: data });
	},
});

export default GlobalStore;
