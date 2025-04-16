import React, { useEffect, useRef, useState } from "react";

import { format } from "date-fns";
import PropTypes from "prop-types";
import { Camera } from "react-camera-pro";
import { useFormContext } from "react-hook-form";
import {
	Circle,
	MapContainer,
	Marker,
	TileLayer,
	useMapEvents,
} from "react-leaflet";
import { toast } from "react-toastify";

import FileApi from "@/apis/v1/FileApi";
import AttendanceApi from "@/apis/v1/LeaveApi/AttendanceApi";
import { Spinner } from "@/components/atoms/Spinner";
import { Button } from "@/components/ui/Button";
import { useCustomMutation } from "@/hooks/useCustomMutation";
import HookFormProvider from "@/providers/HookFormProvider";
import { base64toBlob } from "@/services/helper";

import "leaflet/dist/leaflet.css";

function CurrentPosition() {
	const { setValue } = useFormContext();
	const [position, setPosition] = useState(null);
	const map = useMapEvents({
		click() {
			map.locate();
		},
		locationfound(e) {
			setPosition(e.latlng);
			setValue("latitude", e.latlng.lat);
			setValue("longitude", e.latlng.lng);
			map.flyTo(e.latlng, map.getZoom());
		},
	});

	useEffect(() => {
		map.locate();
	}, []);

	return position === null ? null : <Marker position={position} />;
}

const SubmitClockInOut = ({ handleChangeComponent, clockType }) => {
	const camera = useRef(null);
	const [location, setLocation] = useState(null);

	const {
		onSubmit: onSubmitPostTodayClockIn,
		isLoading: isLoadingSubmitPostTodayClockIn,
	} = useCustomMutation({
		api: AttendanceApi.postTodayClockIn,
		invalidateQueries: ["clockToday"],
		onError: (res) => {
			toast.error(res.message);
		},
		onSuccess: (res) => {
			toast.success(res.message);
			handleChangeComponent(0);
		},
	});

	const { onSubmit: onUploadS3, isLoading: isLoadingUploadS3 } =
		useCustomMutation({
			api: FileApi.upload,
		});

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(success) => {
				setLocation({
					latitude: success.coords.latitude,
					longitude: success.coords.longitude,
				});
			},
			(error) => {
				toast.error(error.message);
			},
			{
				enableHighAccuracy: true,
				maximumAge: 1000,
			},
		);
	}, []);

	const handleSubmit = async (data, e) => {
		const imageKey = `attendance/clock-in-out/${format(new Date(), "yyyy-MM-dd HH:mm:ss")}.jpeg`;
		const {
			data: { url },
		} = await FileApi.getPresignedUpload({ key: imageKey });
		const file = await base64toBlob(
			camera.current.takePhoto(),
			imageKey,
			"image/jpeg",
		);
		onUploadS3({ url, file });
		data.image = imageKey;
		data.latitude = data.latitude.toString().slice(0, -1);
		data.longitude = data.longitude.toString().slice(0, -1);
		onSubmitPostTodayClockIn(data, e);
	};

	return (
		<div className="flex w-full flex-col">
			<HookFormProvider
				defaultValues={{
					latitude: location?.latitude,
					longitude: location?.longitude,
					type: clockType,
				}}
				onSubmit={handleSubmit}
				className="flex w-full flex-col"
			>
				{location ? (
					<MapContainer
						center={[location?.latitude, location?.longitude]}
						zoom={17}
						maxZoom={18}
						minZoom={14}
						scrollWheelZoom={true}
						className="z-30 h-44 w-full md:h-80"
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						<CurrentPosition />
						<Circle
							center={[location?.latitude, location?.longitude]}
							pathOptions={{
								stroke: false,
								fillColor: "rgb(0,10,220)",
								fillOpacity: 0.2,
							}}
							radius={100}
						/>
					</MapContainer>
				) : null}
				<Camera ref={camera} facingMode="user" aspectRatio={16 / 9} />
				<div className="mt-2 flex w-full gap-2">
					<Button
						variant="outline"
						type="button"
						onClick={() => handleChangeComponent(0)}
						className="w-full border-primary text-primary hover:border-primary/50 hover:text-primary/50"
					>
						Cancel
					</Button>
					<Button
						className="w-full"
						disabled={isLoadingSubmitPostTodayClockIn || isLoadingUploadS3}
					>
						{isLoadingSubmitPostTodayClockIn || isLoadingUploadS3 ? (
							<Spinner />
						) : (
							"Submit"
						)}
					</Button>
				</div>
			</HookFormProvider>
		</div>
	);
};

SubmitClockInOut.propTypes = {
	handleChangeComponent: PropTypes.func,
	clockType: PropTypes.number,
};

export default SubmitClockInOut;
