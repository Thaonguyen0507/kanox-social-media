import React, { useEffect, useRef, forwardRef } from "react";
import { definePlaceAutocomplete } from "../location/googleMapsInit";

const PlaceAutocomplete = forwardRef(({ onPlaceSelect }, ref) => {
    const internalRef = useRef(null);
    const elRef = ref || internalRef;

    useEffect(() => {
        definePlaceAutocomplete().then(() => {
            const el = elRef.current;
            if (!el) return;

            el.setAttribute("placeholder", "Nhập địa điểm");

            const handlePlaceChange = (event) => {
                const place = event.detail;
                if (place?.geometry) {
                    const lat = place.geometry.location.lat;
                    const lng = place.geometry.location.lng;
                    const name = place.formattedAddress || place.displayName || "";

                    onPlaceSelect?.({
                        ...place,
                        formattedAddress: name,
                        latitude: lat,
                        longitude: lng,
                    });
                }
            };

            el.addEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);
            return () => {
                el.removeEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);
            };
        }).catch((err) => {
            console.error("🧨 Không thể khởi tạo PlaceAutocomplete:", err);
        });
    }, [onPlaceSelect]);


    return (
        <gmpx-place-autocomplete
            ref={elRef}
            style={{
                width: "100%",
                display: "block",
                borderBottom: "1px solid #ccc",
                padding: "8px",
            }}
            country="VN"
        />
    );
});

export default PlaceAutocomplete;
