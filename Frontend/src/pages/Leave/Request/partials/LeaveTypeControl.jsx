import React, { useState } from "react";

import PropTypes from "prop-types";

import LeaveRequestApi from "@/apis/v1/LeaveApi/LeaveRequestApi";
import LeaveTypeApi from "@/apis/v1/LeaveApi/LeaveTypeApi";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { useCustomQuery } from "@/hooks/useCustomQuery";

const LeaveTypeControl = ({ id = null }) => {
	const [search, setSearch] = useState(null);

	const { data: dataLeaveType, isLoading: isLoadingLeaveType } = useCustomQuery(
		{
			api: LeaveTypeApi.getLeaveType,
			queryKey: ["leaveType", { search }],
			queryParams: { search },
		},
	);

	return (
		<>
			<SelectControl
				label="Leave Type"
				name="leavetype_id"
				options={dataLeaveType?.data
					?.filter((i) => (id ? i.id !== +id : true))
					?.map((v) => ({
						value: v.id,
						label: v.name,
					}))}
				onInputChange={(v) => setSearch(v)}
				isLoading={isLoadingLeaveType}
				isClearable
			/>
		</>
	);
};

LeaveTypeControl.propTypes = {
	id: PropTypes.string,
};

export default LeaveTypeControl;
