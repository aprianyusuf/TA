import isArray from "lodash/isArray";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";

import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/Form";
import { InputSelect } from "@/components/ui/InputSelect";
import { cn } from "@/libs/utils";

const SelectControl = ({
	name,
	label,
	isMultiple,
	placeholder,
	options = [],
	isDisabled,
	onInputChange,
	isRequired = false,
	setter,
	hint,
	isLoading = false,
	className,
	isClearable = false,
	...props
}) => {
	const {
		control,
		formState: { errors },
	} = useFormContext();
	const [fieldName, index, properties] = name.split(".");

	const getErrorMessage = () => {
		if (errors[name]?.message) return errors[name].message;
		if (isArray(errors[fieldName]) && errors[fieldName][index]) {
			if (errors[fieldName][index]?.message)
				return errors[fieldName][index].message;
			if (errors[fieldName][index][properties]?.message)
				return errors[fieldName][index][properties].message;
		}
		return null;
	};

	const handleOnChange = (value) => {
		setter && setter(value);
		return isMultiple
			? value.map((item) => item.value)
			: (value?.value ?? null);
	};

	const renderValue = (value) => {
		if (isMultiple) {
			return options.filter((option) => value?.includes(option.value));
		}

		return options.find((option) => option.value === value) ?? null;
	};

	return (
		<FormField
			control={control}
			name={name}
			defaultValue=""
			render={({ field: { onChange, value, onBlur } }) => (
				<FormItem className={cn("flex w-full flex-col gap-2", className)}>
					{label ? (
						<FormLabel className="font-medium">{label}</FormLabel>
					) : null}
					<FormControl>
						<div className="flex w-full flex-col">
							<InputSelect
								name={name}
								isDisabled={isDisabled}
								isMultiple={isMultiple}
								placeholder={placeholder || "Select " + label}
								options={options}
								onInputChange={onInputChange && onInputChange}
								onChange={(options) => onChange(handleOnChange(options))}
								onBlur={onBlur}
								value={renderValue(value)}
								error={getErrorMessage()}
								isRequired={isRequired}
								isLoading={isLoading}
								isClearable={isClearable}
								{...props}
							/>
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

SelectControl.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string,
	isMultiple: PropTypes.bool,
	placeholder: PropTypes.string,
	options: PropTypes.array,
	isDisabled: PropTypes.bool,
	onInputChange: PropTypes.func,
	isRequired: PropTypes.bool,
	ref: PropTypes.object,
	setter: PropTypes.func,
	hint: PropTypes.any,
	isLoading: PropTypes.bool,
	className: PropTypes.string,
	isClearable: PropTypes.bool,
};

export default SelectControl;
