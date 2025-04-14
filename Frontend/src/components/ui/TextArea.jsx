import * as React from "react";

import PropTypes from "prop-types";

import { cn } from "@/libs/utils";

const TextArea = React.forwardRef(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
TextArea.displayName = "TextArea";

TextArea.propTypes = {
	className: PropTypes.string,
};

export { TextArea };
