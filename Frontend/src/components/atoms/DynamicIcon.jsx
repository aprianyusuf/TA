import React, { lazy, Suspense } from "react";

import PropTypes from "prop-types";

import { Spinner } from "./Spinner";

const DynamicIcon = ({ name, ...props }) => {
	const IconComponent = lazy(() =>
		import(`lucide-react`).then((mod) => ({ default: mod[name] })),
	);

	return (
		<Suspense fallback={<Spinner className="size-4" />}>
			<IconComponent {...props} />
		</Suspense>
	);
};

DynamicIcon.propTypes = {
	name: PropTypes.string,
};

export default DynamicIcon;
