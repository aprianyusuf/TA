import React from "react";

import PropTypes from "prop-types";
import { useFormContext, useWatch } from "react-hook-form";

import CheckboxControl from "@/components/moleculs/Control/CheckboxControl";
import { Card, CardContent } from "@/components/ui/Card";
import { FormLabel } from "@/components/ui/Form";
import { ScrollArea } from "@/components/ui/ScrollArea";

const PositionPermission = ({ organizationPermission = [] }) => {
	const {
		control,
		formState: { errors },
		setValue,
	} = useFormContext();

	const permissions = useWatch({
		control,
		name: "permissions",
	});

	return (
		<div className="flex flex-col w-full gap-2">
			<FormLabel className="font-medium">Position Permission</FormLabel>
			<p className="text-sm font-normal text-red-500 dark:text-red-900">
				{errors?.permissions?.message ?? errors?.permissions?.root?.message}
			</p>
			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
				{organizationPermission
					?.reduce((result, item) => {
						let group = result.find(
							(group) => group.module === item.moduleName,
						);

						if (!group) {
							group = { module: item.moduleName, items: [] };
							result.push(group);
						}

						group.items.push(item);

						return result;
					}, [])
					.map((v, i) => {
						return (
							<div key={`${v}-${i}`}>
								<span>{v.module}</span>
								<Card className="mt-2">
									<CardContent className="p-2">
										<CheckboxControl
											label={"Select All"}
											name={v.module}
											key={v.module}
											inputChange={(val) => {
												if (val) {
													Object.keys(permissions)
														.filter((p) => v.items.map((s) => s.code).includes(p))
														.forEach((vl) => {
															setValue(`permissions.${vl}.value`, true);
														});
												} else {
													Object.keys(permissions)
														.filter((p) => v.items.map((s) => s.code).includes(p))
														.forEach((vl) => {
															setValue(`permissions.${vl}.value`, false);
														});
												}
											}}
											value={Object.values(permissions).filter(i => i.group === v.module).length === Object.values(permissions).filter(i => i.group === v.module && i.value).length}
										/>
										<ScrollArea className="h-64">
											{Object.keys(permissions)
												.filter((p) => v.items.map((s) => s.code).includes(p))
												.map((field) => {
													return (
														<div key={field} className="flex gap-2">
															<CheckboxControl
																label={permissions[field].name}
																name={`permissions.${field}.value`}

															/>
														</div>
													);
												})}
										</ScrollArea>
									</CardContent>
								</Card>
							</div>
						)
					})}
			</div>
		</div>
	);
};

PositionPermission.propTypes = {
	organizationPermission: PropTypes.array,
};

export default PositionPermission;
