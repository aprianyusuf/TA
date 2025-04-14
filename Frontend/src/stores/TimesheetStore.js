const initialState = {
	selectedAs: "My Self",
};

const TimesheetStore = (set, _) => ({
	...initialState,

	setTimesheetStore: (key, data) => {
		set({ [key]: data });
	},
});

export default TimesheetStore;
