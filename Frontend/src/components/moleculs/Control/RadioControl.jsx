import React from "react";

import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";

import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	RadioGroup,
	RadioGroupItem,
} from "@/components/ui";

const RadioControl = ({ name, label, children }) => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="space-y-3">
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<div className="flex w-full flex-col">
							<RadioGroup
								onValueChange={field.onChange}
								defaultValue={field.value}
								className="flex flex-col space-y-1"
							>
								{children}
							</RadioGroup>
							<FormMessage className="mt-1" />
						</div>
					</FormControl>
				</FormItem>
			)}
		/>
	);
};

RadioControl.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	children: PropTypes.node,
};

const RadioItem = ({ value, label }) => {
	return (
		<FormItem className="flex items-center space-x-3 space-y-0">
			<FormControl>
				<RadioGroupItem value={value} />
			</FormControl>
			<FormLabel className="font-normal">{label}</FormLabel>
		</FormItem>
	);
};

RadioItem.propTypes = {
	value: PropTypes.any,
	label: PropTypes.string,
};

export { RadioControl, RadioItem };
