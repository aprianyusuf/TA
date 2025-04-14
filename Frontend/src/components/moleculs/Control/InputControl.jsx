import { useState } from "react";

import clsx from "clsx";
import { CircleX, Eye, EyeOff } from "lucide-react";
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
import { Input } from "@/components/ui/Input";

const InputControl = ({
	name,
	label,
	type = "text",
	className,
	placeholder,
	inputChange,
	isDisabled = false,
	hint,
	isClearable = false,
	isLoading: _ = false,
	leftAddOn,
	...props
}) => {
	const {
		control,
		resetField,
		watch,
		formState: { errors },
	} = useFormContext();
	const [showInput, setShowInput] = useState(false);

	return (
		<FormField
			control={control}
			name={name}
			render={({ field: { onChange, value } }) => (
				<FormItem>
					{label ? (
						<FormLabel className="font-medium">{label}</FormLabel>
					) : null}
					<FormControl>
						<div className="flex w-full flex-col">
							<div className="relative">
								<Input
									className={twMerge(
										clsx({
											"border-red-500": errors[name],
										}),
										className,
									)}
									type={showInput ? "text" : type}
									placeholder={placeholder || label}
									autoComplete="off"
									disabled={isDisabled}
									value={value || ""}
									onChange={
										inputChange ? (e) => inputChange(e, onChange) : onChange
									}
									{...props}
								/>
								{leftAddOn}
								{isClearable &&
								watch(name) &&
								type === "text" &&
								!isDisabled ? (
									<button
										title="Clear"
										type="button"
										onClick={() => resetField(name)}
										className="absolute right-3 top-1/2 -translate-y-1/2"
									>
										<CircleX className="text-slate-500" />
									</button>
								) : null}
								{type === "password" && !isDisabled ? (
									<button
										title={showInput ? "Hide" : "Show"}
										type="button"
										onClick={() => setShowInput(!showInput)}
										className="absolute right-3 top-1/2 -translate-y-1/2"
									>
										{showInput ? (
											<Eye className="text-slate-500" />
										) : (
											<EyeOff className="text-slate-500" />
										)}
									</button>
								) : null}
							</div>
							<FormMessage className="mt-0" />
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

InputControl.propTypes = {
	name: PropTypes.string,
	label: PropTypes.string,
	type: PropTypes.string,
	className: PropTypes.string,
	placeholder: PropTypes.string,
	inputChange: PropTypes.func,
	isDisabled: PropTypes.bool,
	hint: PropTypes.any,
	isClearable: PropTypes.bool,
	isLoading: PropTypes.bool,
	leftAddOn: PropTypes.node,
};

export default InputControl;
