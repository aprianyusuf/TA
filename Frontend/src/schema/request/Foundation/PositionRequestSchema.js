import * as Yup from "yup";

const createPermissionSchema = (permissionsData) => {
	const permissionsShape = Object.keys(permissionsData).reduce((acc, key) => {
		acc[key] = Yup.object({
			value: Yup.boolean().required(),
			name: Yup.string().required(),
			group: Yup.string().required(),
		});
		return acc;
	}, {});

	return Yup.object()
		.shape(permissionsShape)
		.test("at-least-one-true", "* Select minimum 1 permission", (obj) =>
			Object.values(obj || {}).some((item) => item.value === true),
		);
};

export const AddPositionSchema = (permissions = {}) =>
	Yup.object().shape({
		name: Yup.string().required("* Filled is required"),
		position_id: Yup.string().nullable(),
		permissions: createPermissionSchema(permissions),
	});
