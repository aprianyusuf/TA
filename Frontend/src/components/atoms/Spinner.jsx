import React from "react";

import PropTypes from "prop-types";

import { cn } from "@/libs/utils";

export const Spinner = ({ className }) => {
	return (
		<div
			className={cn(
				"loader size-6 rounded-full border-4 border-t-4 border-gray-200 ease-linear",
				className,
			)}
		></div>
	);
};

Spinner.propTypes = {
	className: PropTypes.string,
};

export const SpinnerDot = ({ className = "bg-primary", size = "size-2" }) => {
	return (
		<div className="flex gap-1">
			{["[animation-delay:-0.3s]", "[animation-delay:-0.15s]", ""].map(
				(v, i) => (
					<div
						key={i}
						className={cn(`animate-bounce rounded-full ${v}`, size, className)}
					></div>
				),
			)}
		</div>
	);
};

SpinnerDot.propTypes = {
	className: PropTypes.string,
	size: PropTypes.string,
};
