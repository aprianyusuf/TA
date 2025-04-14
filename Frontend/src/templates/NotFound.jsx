import React from "react";

import { MessageCircleWarning } from "lucide-react";

const NotFound = ({ message = "" }) => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-4">
			<MessageCircleWarning className="text-red-500 md:size-14" />
			<span className="font-medium text-red-400 md:text-lg">{message}</span>
		</div>
	);
};

export default NotFound;
