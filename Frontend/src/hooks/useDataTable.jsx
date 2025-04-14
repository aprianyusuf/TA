import { useMemo, useState } from "react";

import { paginationQuery } from "@/services/helper";

import { useCustomQuery } from "./useCustomQuery";

export const useFilterTable = ({ rules = [] }) => {
	const [columnFilters, setColumnFilters] = useState({
		filters: [
			{ column: rules[0].column, condition: rules[0].filters[0], value: "" },
		],
	});
	const [columnVisibility, setColumnVisibility] = useState({});

	return {
		columnFilters,
		setColumnFilters,
		columnVisibility,
		setColumnVisibility,
	};
};

export const useStateDataTable = () => {
	const [{ pageSize, pageIndex }, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const pagination = useMemo(
		() => ({
			pageIndex,
			pageSize,
		}),
		[pageIndex, pageSize],
	);

	return {
		pagination,
		setPagination,
	};
};

export const useDataTable = ({
	api = () => {},
	queryKey,
	queryParams = {},
	enabled = true,
}) => {
	const [{ pageSize, pageIndex }, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const pagination = useMemo(
		() => ({
			pageIndex,
			pageSize,
		}),
		[pageIndex, pageSize],
	);

	const { data, isLoading, dataUpdatedAt } = useCustomQuery({
		api,
		queryKey: [queryKey, { page: pageIndex, limit: pageSize, ...queryParams }],
		queryParams: {
			...paginationQuery(pagination),
			...queryParams,
		},
		enabled,
	});

	return {
		pagination,
		setPagination,
		data,
		isLoading,
		dataUpdatedAt,
	};
};
