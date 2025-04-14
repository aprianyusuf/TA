import React from "react";

import PropTypes from "prop-types";

const MainLoader = ({ title }) => {
	return (
		<div className="absolute z-[999] flex size-full flex-col items-center justify-center bg-black/50 text-center">
			<div className="inline-flex w-full items-center justify-center gap-2">
				<div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.7s]"></div>
				<div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.3s]"></div>
				<div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.7s]"></div>
			</div>
			<h2 className="text-zinc-900 dark:text-white">Loading...</h2>
			{title && <p className="text-zinc-600 dark:text-zinc-400">{title}</p>}
		</div>
	);
};

MainLoader.propTypes = {
	title: PropTypes.string,
};

export default MainLoader;
