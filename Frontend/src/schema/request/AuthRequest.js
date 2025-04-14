import * as Yup from "yup";

export const AuthLoginRequest = Yup.object().shape({
	email: Yup.string().email().required("Masukkan email"),
	password: Yup.string().required("Masukkan password"),
});

export const AuthRegisterRequest = Yup.object().shape({
	firstName: Yup.string().required("Nama depan wajib diisi"),
	lastName: Yup.string().required("Nama belakang wajib diisi"),
	email: Yup.string()
		.matches(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			"Email tidak valid",
		)
		.required("Email wajib diisi"),
	phoneNumber: Yup.string().required("Nomor telepon wajib diisi"),
	password: Yup.string().required("Kata sandi wajib diisi"),
	passwordConfirmation: Yup.string().test(
		"passwords-match",
		"Kata sandi tidak sesuai",
		function (value) {
			return this.parent.password === value;
		},
	),
	gender: Yup.string().required("Jenis kelamin wajib diisi"),
	birthDate: Yup.string().required("Tanggal lahir wajib diisi"),
});
