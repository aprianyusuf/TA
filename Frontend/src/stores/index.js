import { create } from "zustand";
import { devtools } from "zustand/middleware";

import AuthStore from "./AuthStore";
import GlobalStore from "./GlobalStore";
import TimesheetStore from "./TimesheetStore";

const useBoundStore = create()(
	devtools((...a) => ({
		...AuthStore(...a),
	})),
);

const useBoundLocalStore = create()(
	devtools((...a) => ({
		...GlobalStore(...a),
		...TimesheetStore(...a),
	})),
);

export { useBoundStore, useBoundLocalStore };
