import React, { lazy, Suspense, useMemo, useState } from "react";

import { createColumnHelper } from "@tanstack/react-table";
import { add, format, parse } from "date-fns";

import AttendanceApi from "@/apis/v1/LeaveApi/AttendanceApi";
import { Spinner } from "@/components/atoms/Spinner";
import { Table, TableCell, TableHeader } from "@/components/organisms/Table";
import { Button } from "@/components/ui/Button";
import { useDataTable } from "@/hooks/useDataTable";
import { openFileOnNewPage } from "@/services/helper";

const SubmitClockInOut = lazy(() => import("./patials/SubmitClockInOut"));

const columnHelper = createColumnHelper();

const ClockInOut = () => {
	const [component, setComponent] = useState(0);

	const { data, isLoading, pagination, setPagination } = useDataTable({
		api: AttendanceApi.getTodayClockIn,
		queryKey: "clockToday",
	});

	const columns = useMemo(
		() => [
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
			}),
			columnHelper.accessor("type", {
				header: <TableHeader className={"flex gap-1"}>Type</TableHeader>,
				width: "w-44",
				cell: ({ getValue }) => (
					<TableCell>{getValue() === 1 ? "Clock In" : "Clock Out"}</TableCell>
				),
			}),
			columnHelper.accessor("latLong", {
				header: <TableHeader>Location</TableHeader>,
				width: "w-44",
				cell: ({ row: { original } }) => (
					<TableCell>{`${original.latitude}, ${original.longitude}`}</TableCell>
				),
			}),
			columnHelper.accessor("image", {
				header: <TableHeader>Image</TableHeader>,
				width: "w-56",
				cell: ({ getValue }) => (
					<TableCell className="truncate">
						<span
							className="hover:cursor-pointer hover:underline"
							onClick={() => openFileOnNewPage(getValue())}
						>
							Image
						</span>
					</TableCell>
				),
			}),
			columnHelper.accessor("note", {
				header: <TableHeader>Note</TableHeader>,
				width: "w-56",
				cell: ({ getValue }) => (
					<TableCell className="truncate">{getValue()}</TableCell>
				),
			}),
			// columnHelper.accessor("submittedAt", {
			//     header: <TableHeader>Note</TableHeader>,
			//     width: "w-56",
			//     cell: ({ getValue }) => (
			//         <TableCell className="truncate">{format(add(parse(getValue(), "yyyy-MM-dd HH:mm:ss", new Date()), {
			//             minutes: new Date().getTimezoneOffset() * -1
			//         }), "dd-MM-yyyy HH:mm:ss")}</TableCell>
			//     ),
			// }),
		],
		[],
	);

	const handleChangeComponent = (c) => setComponent(c);

	return (
		<>
			{component === 0 ? (
				<>
					<div className="flex w-full gap-3">
						<Button onClick={() => handleChangeComponent(1)} className="w-full">
							Clock In
						</Button>
						<Button onClick={() => handleChangeComponent(2)} className="w-full">
							Clock Out
						</Button>
					</div>
					<Table
						columns={columns}
						data={data?.data}
						isLoading={isLoading}
						setPagination={setPagination}
						state={pagination}
						total={data?.count}
						isUsePagination={false}
					/>
				</>
			) : (
				<Suspense
					fallback={
						<div className="flex h-full w-full items-center justify-center">
							<Spinner />
						</div>
					}
				>
					<SubmitClockInOut
						handleChangeComponent={handleChangeComponent}
						clockType={component}
					/>
				</Suspense>
			)}
		</>
	);
};

export default ClockInOut;
