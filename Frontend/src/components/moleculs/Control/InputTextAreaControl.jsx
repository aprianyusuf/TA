import React from "react";

import clsx from "clsx";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/Form";
import { TextArea } from "@/components/ui/TextArea";

const InputTextAreaControl = ({
	name,
	label,
	className,
	placeholder,
	isDisabled = false,
	hint,
}) => {
	const {
		control,
		formState: { errors },
	} = useFormContext();

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel className="font-medium">{label}</FormLabel>
					<FormControl>
						<div className="flex w-full flex-col">
							<TextArea
								placeholder={placeholder}
								className={twMerge(
									"resize-none",
									clsx({
										"border-red-500": errors[name],
									}),
									className,
								)}
								disabled={isDisabled}
								{...field}
							/>
							<FormMessage />
						</div>
					</FormControl>
					{hint && <FormDescription className="mt-1">{hint}</FormDescription>}
				</FormItem>
			)}
		/>
	);
};

InputTextAreaControl.propTypes = {
	name: PropTypes.string,
	label: PropTypes.string,
	type: PropTypes.string,
	className: PropTypes.string,
	placeholder: PropTypes.string,
	inputChange: PropTypes.func,
	isDisabled: PropTypes.bool,
	hint: PropTypes.any,
	isLoading: PropTypes.bool,
};

export default InputTextAreaControl;
