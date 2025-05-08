import React from "react";

import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/Checkbox";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/Form";

const CheckboxControl = ({
	name,
	label,
	inputChange,
	isDisabled = false,
	hint,
}) => {
	const { control } = useFormContext();

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md p-2">
					<FormControl>
						<Checkbox
							checked={!!field.value}
							onCheckedChange={
								inputChange
									? (e) => inputChange(e, field.onChange)
									: field.onChange
							}
							disabled={isDisabled}
							onChange={
								inputChange
									? (e) => inputChange(e, field.onChange)
									: field.onChange
							}
						/>
					</FormControl>
					<div className="space-y-1 leading-none">
						<FormLabel className="font-medium">{label}</FormLabel>
						<FormMessage className="mt-0" />
						{hint ? (
							<FormDescription className="mt-1">{hint}</FormDescription>
						) : null}
					</div>
				</FormItem>
			)}
		/>
	);
};

CheckboxControl.propTypes = {
	name: PropTypes.string,
	label: PropTypes.string,
	inputChange: PropTypes.func,
	isDisabled: PropTypes.bool,
	hint: PropTypes.any,
};

export default CheckboxControl;
