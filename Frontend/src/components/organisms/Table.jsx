import React, { Fragment, useState } from "react";

import {
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import {
	Check,
	ChevronLeft,
	ChevronsUpDown,
	Filter,
	Trash2,
} from "lucide-react";
import PropTypes from "prop-types";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";

import { Skeleton } from "@/components/ui/Skeleton";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import { cn } from "@/libs/utils";
import HookFormProvider from "@/providers/HookFormProvider";
import { capitalizeEachWord, numberWithDelimeter } from "@/services/formatter";

import { SpinnerDot } from "../atoms/Spinner";
import InputControl from "../moleculs/Control/InputControl";
import { Button } from "../ui/Button";
import { Command, CommandGroup, CommandItem, CommandList } from "../ui/Command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import { FormControl, FormField, FormItem } from "../ui/Form";
import {
	Popover,
	PopoverArrow,
	PopoverClose,
	PopoverContent,
	PopoverTrigger,
} from "../ui/Popover";

const Table = ({
	columns,
	data = [...Array.from({ length: 10 })],
	pageCount,
	state,
	setPagination,
	setColumnVisibility,
	total = 0,
	isUsePagination = true,
	className = "",
	rowClass = () => {},
	isLoading = false,
	getRowCanExpand,
	ExpandedComponent,
	classNameHeader,
	children,
}) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		pageCount,
		onPaginationChange: setPagination,
		onColumnVisibilityChange: setColumnVisibility,
		state: { state },
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		initialState: {
			columnVisibility: {
				...Object.assign(
					{},
					...columns.map((item) => ({
						[item.accessorKey]: item.isVisible ?? true,
					})),
				),
			},
			expanded: state?.expanded,
		},
		getRowCanExpand: getRowCanExpand,
		getExpandedRowModel: getExpandedRowModel(),
	});

	return (
		<>
			{children
				? children({
						columnFilter: table
							.getAllColumns()
							.filter(({ columnDef }) => columnDef.enableColumnFilter)
							.map(({ columnDef }) => ({
								label: capitalizeEachWord(columnDef.id),
								value: columnDef.id,
							})),
						columnVisibility: table
							.getAllColumns()
							.filter(({ columnDef }) => columnDef.enableHiding),
						table,
					})
				: null}
			<div
				className={twMerge(
					"custom-scrollbar round-table relative overflow-auto px-2 text-black shadow-md",
					className,
				)}
			>
				<table className="custom-scrollbar w-full border-collapse p-1">
					<thead className={twMerge("sticky top-0 z-[5] bg-white")}>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className={twMerge("p-3 text-left", classNameHeader)}
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{(!data?.length || data?.filter(Boolean).length === 0) &&
						!isLoading ? (
							<tr>
								<td
									className="border border-solid border-slate-200 p-2 text-center font-normal text-secondary/80"
									colSpan={table.getAllColumns().length}
								>
									Data not found
								</td>
							</tr>
						) : (
							table.getPaginationRowModel().rows.map((row) => (
								<Fragment key={row.id}>
									<tr
										className={twMerge(
											clsx({
												"bg-slate-200/80": row?.index % 2 === 0,
											}),
											rowClass(row),
										)}
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className={twMerge(
													"overflow-hidden overflow-ellipsis border-b border-solid border-slate-200 p-2",
													clsx({
														[cell.column.columnDef.width]:
															!!cell.column.columnDef.width,
														"border-0 border-solid border-slate-200":
															row.getIsExpanded(),
													}),
													cell.column.columnDef.className,
												)}
												style={
													cell.column.columnDef.style
														? cell.column.columnDef.style(cell)
														: {}
												}
											>
												{isLoading ? (
													<Skeleton className="h-4" />
												) : (
													flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)
												)}
											</td>
										))}
									</tr>
									{row.getIsExpanded() && (
										<tr>
											<td
												colSpan={row.getVisibleCells().length}
												className="border-b border-solid border-slate-200 px-3 py-3"
											>
												<ExpandedComponent row={row} />
											</td>
										</tr>
									)}
								</Fragment>
							))
						)}
					</tbody>
				</table>
			</div>
			{/* Pagination */}
			{isUsePagination && total > 0 && !isLoading ? (
				<div className="mt-2 flex w-full flex-row justify-between px-2 pb-14 text-black md:px-8 lg:pb-2">
					<div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
						<span className="flex gap-2">
							Show
							<select
								className="border-primary-500 rounded-md border px-1"
								value={state.pageSize}
								onChange={(e) => {
									table.setPageSize(Number(e.target.value));
									table.setPageIndex(0);
								}}
							>
								{[10, 20, 50, 100].map((pageSize) => (
									<option key={pageSize} value={pageSize}>
										{pageSize}
									</option>
								))}
								{total < 500 ? <option value={total}>All</option> : null}
							</select>
						</span>
						<p>from {numberWithDelimeter(total)} data</p>
					</div>
					<div className="flex flex-col items-end gap-2 md:float-right md:flex-row md:items-center">
						<span className="flex gap-2">
							<button
								className={`border-primary-500 flex rounded-md border bg-white p-1 ${
									state.pageIndex === 0 ? "text-gray-400" : "text-slate-900"
								}`}
								onClick={() => table.setPageIndex(0)}
								disabled={state.pageIndex === 0}
								type="button"
							>
								<ChevronLeft className="h-4 w-4" />
								<ChevronLeft className="ml-[-12px] h-4 w-4" />
							</button>
							<button
								className={`border-primary-500 rounded-md border bg-white p-1 ${
									state.pageIndex === 0 ? "text-gray-400" : "text-slate-900"
								}`}
								onClick={() => table.previousPage()}
								disabled={state.pageIndex === 0}
								type="button"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								className={`border-primary-500 rounded-md border bg-white p-1 ${
									state.pageIndex + 1 === pageCount
										? "text-gray-400"
										: "text-slate-900"
								}`}
								onClick={() => table.nextPage()}
								disabled={state.pageIndex + 1 === pageCount}
								type="button"
							>
								<ChevronLeft className="h-4 w-4 rotate-180 transform" />
							</button>
							<button
								className={`border-primary-500 flex rounded-md border bg-white p-1 ${
									state.pageIndex + 1 === pageCount
										? "text-gray-400"
										: "text-slate-900"
								}`}
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={state.pageIndex + 1 === pageCount}
								type="button"
							>
								<ChevronLeft className="h-4 w-4 rotate-180 transform" />
								<ChevronLeft className="ml-[-12px] h-4 w-4 rotate-180 transform" />
							</button>
						</span>
						<span className="flex items-center gap-1">
							<div>Page</div>
							<strong>
								{state.pageIndex + 1} from {table.getPageCount()}
							</strong>
						</span>
					</div>
				</div>
			) : null}
		</>
	);
};

Table.propTypes = {
	columns: PropTypes.array.isRequired,
	data: PropTypes.array,
	pageCount: PropTypes.number,
	state: PropTypes.object.isRequired,
	setPagination: PropTypes.func,
	setColumnVisibility: PropTypes.func,
	total: PropTypes.number,
	isUsePagination: PropTypes.bool,
	className: PropTypes.string,
	rowClass: PropTypes.func,
	isLoading: PropTypes.bool,
	getRowCanExpand: PropTypes.func,
	ExpandedComponent: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.node,
		PropTypes.element,
	]),
	classNameHeader: PropTypes.string,
	children: PropTypes.any,
};

const TableHeader = ({ className, ...props }) => {
	return <div className={twMerge(className)} {...props} />;
};

TableHeader.propTypes = {
	className: PropTypes.string,
};

const TableCell = ({ className, ...props }) => {
	return (
		<div className={twMerge("text-xs md:text-sm", className)} {...props} />
	);
};

TableCell.propTypes = {
	className: PropTypes.string,
};

const TableFilterForm = () => {
	const { control, watch, setValue } = useFormContext();

	const [filters, availableFilter, filterRules] = watch([
		"filters",
		"availableFilter",
		"filterRules",
	]);

	const { append, remove, fields } = useFieldArray({
		control,
		name: "filters",
	});

	return (
		<>
			<div className="mb-2 flex gap-2 text-slate-700">
				<span className="w-40 font-medium">Column</span>
				<span className="w-32 font-medium">Condition</span>
				<span className="font-medium ">Value</span>
			</div>
			<DropdownMenuSeparator className="mb-2" />
			{fields.map((s, i) => (
				<Fragment key={s.id}>
					<div className="mb-2 flex w-full items-center gap-2">
						<FormField
							control={control}
							name={`filters.${i}.column`}
							render={({ field }) => (
								<FormItem className="flex w-40 flex-col">
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														"w-40 justify-between",
														!field.value && "text-muted-foreground",
														"border-slate-200 text-slate-700",
													)}
												>
													{field.value
														? availableFilter.find(
																(column) => column.value === field.value,
															)?.label
														: "Column"}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-40 p-0">
											<Command>
												<CommandList>
													<CommandGroup>
														{availableFilter.map((column) => (
															<CommandItem
																value={column.label}
																key={column.value}
																onSelect={() => {
																	setValue(`filters.${i}.column`, column.value);
																}}
																disabled={filters.find(
																	(i) => i.column === column.value,
																)}
																className={clsx({
																	"cursor-default text-slate-400":
																		filters.filter(
																			(i) =>
																				i.column !== field.value &&
																				i.column === column.value,
																		).length,
																})}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		column.value === field.value
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{column.label}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name={`filters.${i}.condition`}
							render={({ field }) => (
								<FormItem className="flex w-32 flex-col">
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														"w-32 justify-between",
														!field.value && "text-muted-foreground",
														"border-slate-200 text-slate-700",
													)}
													disabled={!filters[i].column}
												>
													{field.value
														? filterRules
																.find((f) => f.column === filters[i].column)
																?.filters?.map((f) => ({ label: f, value: f }))
																.find(
																	(condition) =>
																		condition.value === field.value,
																)?.label
														: "Condition"}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-32 p-0">
											<Command>
												<CommandList>
													<CommandGroup>
														{filterRules
															.find((f) => f.column === filters[i].column)
															?.filters?.map((f) => ({ label: f, value: f }))
															.map((condition) => (
																<CommandItem
																	value={condition.label}
																	key={condition.value}
																	onSelect={() => {
																		setValue(
																			`filters.${i}.condition`,
																			condition.value,
																		);
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			condition.value === field.value
																				? "opacity-100"
																				: "opacity-0",
																		)}
																	/>
																	{condition.label}
																</CommandItem>
															))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</FormItem>
							)}
						/>
						<InputControl
							name={`filters.${i}.value`}
							className="h-9 flex-grow focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:ring-offset-0"
							placeholder="Search..."
							autofocus
						/>
						{fields.length === 1 && i === 0 ? null : (
							<Trash2
								className="ml-2 basis-1/4 hover:cursor-pointer hover:text-slate-600"
								onClick={() => remove(i)}
							/>
						)}
					</div>
					<DropdownMenuSeparator />
				</Fragment>
			))}
			<div className="flex items-center justify-between">
				<Button
					type="button"
					variant="link"
					className="text-slate-800 hover:no-underline"
					onClick={() => append({ column: "", condition: "", value: "" })}
					disabled={
						fields.length === availableFilter.length ||
						filters?.some(
							(filter) => !filter.column || !filter.condition || !filter.value,
						)
					}
				>
					Add Filter
				</Button>
				<span className="flex gap-2">
					<Button
						variant="link"
						className="text-slate-800 hover:no-underline"
						disabled={
							filters.filter(
								(filter) => filter.column && filter.condition && filter.value,
							).length === 0
						}
						onClick={() => setValue("clear", true)}
					>
						Clear Filter
					</Button>
					<Button
						variant="link"
						className="text-slate-800 hover:no-underline"
						// disabled={fields.length === availableFilter.length}
					>
						Apply Filter
					</Button>
				</span>
			</div>
		</>
	);
};

const TableFilter = ({
	filterRules = [],
	availableFilter = [],
	handleApplyFilter = () => {},
	filterState = {},
	table,
}) => {
	const [open, setOpen] = useState(false);

	const handleApplyFilterForm = (data, _) => {
		data.filters = data.filters.filter(
			(i) => i.column && i.condition && i.value,
		);
		if (data.filters.length === 0 || data.clear) {
			data.filters = [
				{
					column: filterRules[0].column,
					condition: filterRules[0].filters[0],
					value: "",
				},
			];
		}
		handleApplyFilter(data);
		table.setPageIndex(0);
		setOpen(false);
	};

	return (
		<div className="flex">
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger
					className="flex items-center gap-2 rounded-md border border-slate-300/50 px-4 py-2 font-bold text-slate-800 shadow-sm shadow-border"
					onClick={() => setOpen((open) => !open)}
				>
					<Filter />
					<span>Filter</span>
					{filterState?.filters.filter((i) => !!i.value).length ? (
						<span className="ml-2 flex size-6 items-center justify-center rounded-full bg-slate-300 p-2 text-xs text-slate-700">
							{filterState?.filters.filter((i) => !!i.value).length}
						</span>
					) : null}
				</DropdownMenuTrigger>
				<DropdownMenuContent
					sideOffset={4}
					className="w-[32rem] p-3"
					side="bottom"
					align="start"
				>
					<div className="mb-2">In this table apply filter</div>
					<DropdownMenuSeparator className="mb-2" />
					<HookFormProvider
						defaultValues={{
							filters: filterState?.filters,
							filterRules,
							availableFilter,
						}}
						onSubmit={handleApplyFilterForm}
					>
						<TableFilterForm
							filterRules={filterRules}
							availableFilter={availableFilter}
						/>
					</HookFormProvider>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

TableFilter.propTypes = {
	filterRules: PropTypes.array.isRequired,
	availableFilter: PropTypes.array.isRequired,
	handleApplyFilter: PropTypes.func.isRequired,
	filterState: PropTypes.any.isRequired,
	table: PropTypes.any.isRequired,
};

const DeleteRow = ({ payload, api, invalidateQueries = [] }) => {
	const { onSubmit, isLoading } = useCustomMutation({
		api,
		invalidateQueries,
		onError: (res) => {
			toast.error(res.message);
		},
		onSuccess: (res) => {
			toast.success(res.message);
		},
	});

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="bg-red-600 p-2" variant="link" disabled={isLoading}>
					<Trash2 className="size-4 text-white" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="flex w-52 flex-col gap-2 px-4 py-2 shadow-none">
				<PopoverArrow className="fill-white stroke-gray-400" />
				<span className="font-normal">Are you sure?</span>
				<div className="flex gap-2">
					<PopoverClose asChild>
						<Button
							variant="outline"
							className="w-1/2 border-destructive text-destructive hover:border-destructive/70 hover:text-destructive/70"
						>
							Cancel
						</Button>
					</PopoverClose>
					<Button
						className="w-1/2"
						variant="destructive"
						onClick={() => onSubmit(payload)}
						disabled={isLoading}
					>
						{isLoading ? <SpinnerDot className="bg-white" /> : "Submit"}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

DeleteRow.propTypes = {
	payload: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.object,
	]),
	api: PropTypes.func.isRequired,
	invalidateQueries: PropTypes.array.isRequired,
};

export { Table, TableHeader, TableCell, TableFilter, DeleteRow };
