import React, { forwardRef } from "react";

import clsx from "clsx";
import PropTypes from "prop-types";
import ReactSelect from "react-select";

export const InputSelect = forwardRef(
	(
		{
			title,
			isMultiple = false,
			isRequired = false,
			placeholder,
			options,
			error,
			isLoading = false,
			isSearchable = true,
			...props
		},
		ref,
	) => (
		<ReactSelect
			menuPortalTarget={document.body}
			styles={{
				control: (baseStyles) => ({
					...baseStyles,
					border: clsx("1px solid", error ? "#FF0000" : "border-slate-200"),
					boxShadow: "none",
					"&:hover": {
						border: clsx("1px solid", error ? "#FF0000" : "border-slate-200"),
					},
					borderRadius: "6px",
					maxHeight: "fit",
					minHeight: "40px",
				}),
				multiValue: (baseStyles) => ({
					...baseStyles,
					backgroundColor: "transparent",
				}),
				multiValueLabel: (baseStyles) => ({
					...baseStyles,
					backgroundColor: "black",
					color: "white",
					borderWidth: 0,
					borderRadius: 0,
					borderTopLeftRadius: "10px",
					borderBottomLeftRadius: "10px",
				}),
				multiValueRemove: (baseStyles) => ({
					...baseStyles,
					backgroundColor: "black",
					color: "#d6d6d6",
					borderRadius: 0,
					borderWidth: 0,
					borderTopRightRadius: "10px",
					borderBottomRightRadius: "10px",
					"&:hover": {
						backgroundColor: "black",
						color: "white",
					},
				}),
				dropdownIndicator: (baseStyles) => ({
					...baseStyles,
					color: "black",
				}),
				menuPortal: (baseStyles) => ({
					...baseStyles,
					zIndex: 51,
					pointerEvents: "all",
				}),
				menu: (baseStyles) => ({
					...baseStyles,
					zIndex: 51,
				}),
			}}
			options={options}
			placeholder={placeholder || "Select " + title}
			isMulti={isMultiple}
			closeMenuOnSelect={!isMultiple}
			isSearchable={isSearchable}
			required={isRequired}
			isLoading={isLoading}
			theme={(theme) => ({
				...theme,
				colors: {
					...theme.colors,
					primary25: "rgba(148, 163, 184, 0.3)",
					primary: "black",
				},
			})}
			{...props}
			ref={ref}
		/>
	),
);

InputSelect.displayName = "InputSelect";

InputSelect.propTypes = {
	title: PropTypes.string,
	isMultiple: PropTypes.bool,
	isRequired: PropTypes.bool,
	placeholder: PropTypes.string,
	options: PropTypes.array,
	error: PropTypes.string,
	isLoading: PropTypes.bool,
	isSearchable: PropTypes.bool,
};
