import * as React from "react";

import { Check, ChevronsUpDown } from "lucide-react";
import PropTypes from "prop-types";

import { cn } from "@/libs/utils";

import { Button } from "./Button";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "./Command";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export function Combobox({
	items = [],
	value,
	placeholder,
	placeholderEmpty,
	onSelect,
	className,
}) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-56 justify-between truncate"
				>
					{value
						? items.find((item) => item.value === value)?.preview
						: placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("w-56 p-0", className)}>
				<Command>
					<CommandInput placeholder={placeholder} />
					<CommandEmpty>{placeholderEmpty}</CommandEmpty>
					<CommandList>
						{items?.map((item) => (
							<CommandItem
								key={item.value}
								value={item.value}
								onSelect={() => onSelect(item)}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value === item.value ? "opacity-100" : "opacity-0",
									)}
								/>
								{item.label}
							</CommandItem>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

Combobox.propTypes = {
	items: PropTypes.array,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	placeholder: PropTypes.string,
	placeholderEmpty: PropTypes.string,
	onSelect: PropTypes.func,
	className: PropTypes.string,
};
