import React, { useMemo } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { invert } from "lodash";
import { Eye } from "lucide-react";
import PropTypes from "prop-types";

import { Table, TableCell, TableHeader } from "@/components/organisms/Table";
import { Button } from "@/components/ui/Button";
import { TIMESHEET_STATUS } from "@/configs/constant";
import { useStateDataTable } from "@/hooks/useDataTable";
import { capitalizeFirstLetter } from "@/services/formatter";

const columnHelper = createColumnHelper();

const DetailMoreEvent = ({ data = [], handleClickEvent }) => {
	const { pagination, setPagination } = useStateDataTable();

	const columns = useMemo(
		() =>
			({ handleClickEvent }) => [
				columnHelper.accessor("no", {
					header: <TableHeader className={"text-center"}>No</TableHeader>,
					width: "w-4",
					cell: ({ row, table: { getState } }) => (
						<TableCell className="text-center">
							{row.index +
								1 +
								getState().state.pageIndex * getState().state.pageSize}
						</TableCell>
					),
					style: ({ row: { original } }) => ({
						borderLeft: `2px solid ${original.borderColor}`,
					}),
				}),
				columnHelper.accessor("title", {
					header: <TableHeader>Title</TableHeader>,
					width: "w-36",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("start", {
					header: <TableHeader>Start</TableHeader>,
					width: "w-32",
					cell: ({ getValue }) => (
						<TableCell>{format(getValue(), "dd-MM-yyyy HH:mm")}</TableCell>
					),
				}),
				columnHelper.accessor("end", {
					header: <TableHeader>End</TableHeader>,
					width: "w-32",
					cell: ({ getValue }) => (
						<TableCell>{format(getValue(), "dd-MM-yyyy HH:mm")}</TableCell>
					),
				}),
				columnHelper.accessor("timezone", {
					header: <TableHeader>Timezone</TableHeader>,
					width: "w-32",
					cell: ({ getValue }) => <TableCell>{getValue()}</TableCell>,
				}),
				columnHelper.accessor("status", {
					header: <TableHeader>Status</TableHeader>,
					width: "w-32",
					cell: ({ getValue }) => (
						<TableCell>
							{capitalizeFirstLetter(
								invert(TIMESHEET_STATUS)[getValue()].toLowerCase(),
							)}
						</TableCell>
					),
				}),
				columnHelper.accessor("actions", {
					header: <TableHeader className={"text-center"}>Action</TableHeader>,
					cell: ({ row: { original } }) => (
						<TableCell className="flex justify-center gap-2">
							<Button
								className="bg-green-600 p-2"
								variant="link"
								onClick={() =>
									handleClickEvent({
										event: {
											raw: {
												...original,
											},
										},
										fromMoreEvent: true,
										date: original.start,
									})
								}
							>
								<Eye className="size-4 text-white" />
							</Button>
						</TableCell>
					),
				}),
			],
		[],
	);

	return (
		<>
			<Table
				data={data.sort((a, b) => a.start - b.start)}
				columns={columns({ handleClickEvent })}
				isUsePagination={false}
				state={pagination}
				setPagination={setPagination}
				total={data.length}
			/>
		</>
	);
};

DetailMoreEvent.propTypes = {
	data: PropTypes.array,
	handleClickEvent: PropTypes.func,
};

export default DetailMoreEvent;
