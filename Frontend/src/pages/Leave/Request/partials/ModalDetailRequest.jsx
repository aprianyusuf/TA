import React, { useState } from "react";

import { format } from "date-fns";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import LeaveRequestApi from "@/apis/v1/LeaveApi/LeaveRequestApi";
import { Spinner } from "@/components/atoms/Spinner";
import { Button } from "@/components/ui/Button";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import PreviewTimesheet from "@/pages/Timesheet/MonthlyTimesheet/partials/PreviewTimesheet";
import HookFormProvider from "@/providers/HookFormProvider";

const DetailRequest = ({
	handleFormOpen = () => {},
	state: { state, type, event, data },
}) => {
	const [detailState, setDetailState] = useState({
		state,
		type: [0, 1].includes(type) ? 0 : 1,
		event,
	});

	const [leaveRequestData] = useState({
		data,
	});

	const {
		onSubmit: onApproveLeaveRequest,
		isLoading: isLoadingApproveLeaveRequest,
	} = useCustomMutation({
		api: LeaveRequestApi.approveLeaveRequest,
		onSuccess: () => {
			handleFormOpen({ isOpen: false });
		},
		onError: (err) => {
			toast.error(err.message);
		},
		invalidateQueries: [["leave-request"]],
	});

	const {
		onSubmit: onRejectLeaveRequest,
		isLoading: isLoadingRejectLeaveRequest,
	} = useCustomMutation({
		api: LeaveRequestApi.rejectLeaveRequest,
		onSuccess: () => {
			handleFormOpen({ isOpen: false });
		},
		onError: (err) => {
			toast.error(err.message);
		},
		invalidateQueries: [["leave-request"]],
	});

	const handleChangeViewDetail = (type) => {
		setDetailState((prev) => ({
			...prev,
			type,
		}));
	};

	if (detailState.type === 1) {
		return (
			<PreviewTimesheet
				handleChangeViewDetail={handleChangeViewDetail}
				state={detailState.event}
			/>
		);
	}

	const handleSubmit = (data, e) => {
		const payload = {
			id: data?.id,
		};

		const submitValue = e.nativeEvent.submitter.value;

		submitValue === "approve"
			? onApproveLeaveRequest(payload, e)
			: onRejectLeaveRequest(payload, e);
	};

	return (
		<HookFormProvider
			defaultValues={{
				id: leaveRequestData?.data?.id,
			}}
			onSubmit={handleSubmit}
			className="flex-grow"
		>
			<div className="my-2 flex flex-col gap-2">
				<span className="font-medium">Name</span>
				<span className="border-black-400 bg-black-50 inline-block rounded border px-3 py-1 text-sm font-medium text-black">
					{leaveRequestData?.data?.user?.name}
				</span>
			</div>
			<div className="my-2 flex flex-col gap-2">
				<span className="font-medium">Leave Type</span>
				<span className="border-black-400 bg-black-50 inline-block rounded border px-3 py-1 text-sm font-medium text-black">
					{leaveRequestData?.data?.leaveType?.name}
				</span>
			</div>
			<div className="my-2 flex flex-col gap-2">
				<span className="font-medium">Time</span>
				<div className="grid grid-cols-1 gap-1 md:grid-cols-2">
					<span className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-800">
						Start :{" "}
						{leaveRequestData?.data?.startDate
							? format(new Date(leaveRequestData.data.startDate), "dd-MM-yyyy")
							: "-"}
					</span>
					<span className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-800">
						End :{" "}
						{leaveRequestData?.data?.endDate
							? format(new Date(leaveRequestData.data.endDate), "dd-MM-yyyy")
							: "-"}
					</span>
				</div>
			</div>
			<div className="my-2 flex flex-col gap-2">
				<span className="font-medium">Description</span>
				<span className="border-black-400 bg-black-50 inline-block rounded border px-3 py-1 text-sm font-medium text-black">
					{leaveRequestData?.data?.description}
				</span>
			</div>
			<div className="mt-3 flex gap-3 flex justify-end">
				<Button
					disabled={isLoadingApproveLeaveRequest || isLoadingRejectLeaveRequest}
					className="w-36 bg-green-600 text-white hover:bg-green-600 hover:text-black"
					value="accept"
				>
					{isLoadingApproveLeaveRequest || isLoadingRejectLeaveRequest ? (
						<Spinner />
					) : (
						"Accept"
					)}
				</Button>
				<Button
					disabled={isLoadingApproveLeaveRequest || isLoadingRejectLeaveRequest}
					className="w-36 bg-red-600 text-white hover:bg-red-600 hover:text-black"
					value="reject"
				>
					{isLoadingApproveLeaveRequest || isLoadingRejectLeaveRequest ? (
						<Spinner />
					) : (
						"Reject"
					)}
				</Button>
			</div>
		</HookFormProvider>
	);
};

DetailRequest.propTypes = {
	handleFormOpen: PropTypes.func,
	state: PropTypes.object,
};

export default DetailRequest;
