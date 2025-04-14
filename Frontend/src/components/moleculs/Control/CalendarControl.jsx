import React from "react";

import clsx from "clsx";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/Form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/libs/utils";

const CalendarControl = ({
	name,
	label,
	hint,
	placeholder = "Select Date",
	onChangeListen = () => {},
	valueFormat = "dd MMM yyyy",
	className,
	calendarProps = {},
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
				<FormItem
					className={cn(
						"flex w-full flex-col gap-1 overflow-visible",
						className,
					)}
				>
					<FormLabel className="font-medium">{label}</FormLabel>
					<FormControl>
						<div className="flex w-full flex-col">
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-full px-3 py-2 text-left font-normal",
												!value && "text-muted-foreground",
												clsx({
													"border-red-500": errors[name],
												}),
												"1px solid min-h-10 border-slate-200",
											)}
										>
											{value ? (
												format(value, valueFormat)
											) : (
												<span>{placeholder}</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={value}
										onSelect={(e) => onChange(handleOnChange(e))}
										{...calendarProps}
									/>
								</PopoverContent>
							</Popover>
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

CalendarControl.propTypes = {
	name: PropTypes.string,
	label: PropTypes.string,
	hint: PropTypes.any,
	placeholder: PropTypes.string,
	onChangeListen: PropTypes.func,
	valueFormat: PropTypes.string,
	className: PropTypes.string,
	calendarProps: PropTypes.object,
};

export default CalendarControl;
