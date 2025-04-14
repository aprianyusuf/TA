import React from "react";

import clsx from "clsx";
import PropTypes from "prop-types";
import ReactDatePicker from "react-datepicker";
import { useFormContext } from "react-hook-form";

import "react-datepicker/dist/react-datepicker.css";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/Form";
import { cn } from "@/libs/utils";

const DateTimeControl = ({
	name,
	label,
	hint,
	dateFormat = "dd/MM/yyyy HH:mm",
	showTimeInput = false,
	placeholder = "Select Date",
	datePickerOptions = {},
	onChangeListen = () => {},
}) => {
	const {
		control,
		formState: { errors },
	} = useFormContext();

	const handleOnChange = (val) => {
		onChangeListen(val);
		return val;
	};
	return (
		<FormField
			control={control}
			name={name}
			render={({ field: { onChange, value } }) => (
				<FormItem className="flex w-full flex-col gap-1 overflow-visible">
					<FormLabel className="font-medium">{label}</FormLabel>
					<FormControl>
						<div className="flex w-full flex-col">
							<ReactDatePicker
								disabled={false}
								dateFormat={dateFormat}
								selected={value}
								onChange={(e) => onChange(handleOnChange(e))}
								showTimeInput={showTimeInput}
								showMonthDropdown
								timeInputLabel="Time:"
								className={cn(
									"w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
									clsx({
										"border-red-500": errors[name],
									}),
								)}
								autoComplete="off"
								placeholderText={placeholder}
								{...datePickerOptions}
							/>
							<FormMessage className="mt-1" />
							{hint && (
								<FormDescription className="mt-1">{hint}</FormDescription>
							)}
						</div>
					</FormControl>
				</FormItem>
			)}
		/>
	);
};

DateTimeControl.propTypes = {
	name: PropTypes.string,
	label: PropTypes.string,
	hint: PropTypes.any,
	dateFormat: PropTypes.string,
	showTimeInput: PropTypes.bool,
	placeholder: PropTypes.string,
	datePickerOptions: PropTypes.object,
	onChangeListen: PropTypes.func,
};

export default DateTimeControl;
