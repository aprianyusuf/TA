import { useQuery } from "@tanstack/react-query";

import { camelizeKeys } from "@/libs/utils";

export const useCustomQuery = ({
	api,
	queryKey,
	enabled = true,
	staleTime = import.meta.env.DEV ? 15 * 60 * 1000 : 3 * 60 * 1000,
	queryParams = {},
	isRefetchInBackground = false,
	refetchInterval = false,
}) => {
	const {
		data,
		isFetching,
		isLoading,
		error,
		refetch,
		isSuccess,
		dataUpdatedAt,
	} = useQuery({
		queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
		queryFn: () => api({ ...queryParams }),
		enabled,
		staleTime,
		select: (res) => camelizeKeys(res),
		refetchIntervalInBackground: isRefetchInBackground,
		refetchInterval: refetchInterval,
	});

	return {
		data,
		isLoading: isLoading || isFetching,
		error,
		refetch,
		isSuccess,
		dataUpdatedAt,
	};
};
