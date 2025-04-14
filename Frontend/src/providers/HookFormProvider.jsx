import { useEffect, useMemo } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/Form";

const HookFormProvider = ({
	children,
	onSubmit,
	schema,
	className,
	defaultValues = {},
}) => {
	const memoizedDefaultValues = useMemo(() => defaultValues, [defaultValues]);
	const methods = useForm({
		resolver: schema ? yupResolver(schema) : null,
		defaultValues: memoizedDefaultValues,
	});

	// useEffect(() => {
	// 	methods.reset(defaultValues);
	// }, [methods, memoizedDefaultValues]);

	return (
		<Form {...methods}>
			<form
				onSubmit={methods.handleSubmit((data, e) => onSubmit(data, e))}
				className={className}
				autoComplete="off"
			>
				{children}
			</form>
		</Form>
	);
};

HookFormProvider.propTypes = {
	children: PropTypes.node.isRequired,
	onSubmit: PropTypes.func.isRequired,
	schema: PropTypes.object,
	className: PropTypes.string,
	defaultValues: PropTypes.object.isRequired,
};

export default HookFormProvider;
