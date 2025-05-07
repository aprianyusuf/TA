import React, { useState } from "react";

import PropTypes from "prop-types";

import PositionApi from "@/apis/v1/MasterApi/PositionApi";
import SelectControl from "@/components/moleculs/Control/SelectControl";
import { useCustomQuery } from "@/hooks/useCustomQuery";

const PositionSuperiorControl = ({ id = null }) => {
	const [search, setSearch] = useState(null);

	const { data: dataPosition, isLoading: isLoadingPosition } = useCustomQuery({
		api: PositionApi.getAll,
		queryKey: ["positions", { search }],
		queryParams: { search, size: 999 },
	});

	return (
		<>
			<SelectControl
				label="Position Superior"
				name="position_id"
				options={dataPosition?.data
					?.filter((i) => (id ? i.id !== +id : true))
					?.map((v) => ({
						value: v.id,
						label: v.name,
					}))}
				onInputChange={(v) => setSearch(v)}
				isLoading={isLoadingPosition}
				isClearable
			/>
		</>
	);
};

PositionSuperiorControl.propTypes = {
	id: PropTypes.string,
};

export default PositionSuperiorControl;
