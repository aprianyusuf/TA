import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCustomMutation = ({
	invalidateQueries = [],
	api = () => {},
	onSuccess = () => {},
	onError = () => {},
}) => {
	const queryClient = useQueryClient();

	const onSubmit = (payload, e) => {
		e?.preventDefault();

		mutation.mutate(payload);
	};

	const mutation = useMutation({
		mutationFn: (payload) => api(payload),
		onSuccess: (response) => {
			invalidateQueries?.map((key) =>
				queryClient.invalidateQueries({
					queryKey: Array.isArray(key) ? key : [key],
				}),
			);
			onSuccess && onSuccess(response);
		},
		onError: (err) => {
			onError && onError(err);
		},
	});

	return {
		onSubmit,
		isLoading: mutation.isPending,
	};
};
