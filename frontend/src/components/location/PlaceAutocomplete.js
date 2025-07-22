import React, { useEffect, useRef, forwardRef } from "react";
import { loadGoogleMaps } from "../utils/googleMapsLoader";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // 🔁 Đặt API Key thật vào đây

const PlaceAutocomplete = forwardRef(({ onPlaceSelect }, ref) => {
    const internalRef = useRef(null);
    const elRef = ref || internalRef;

    useEffect(() => {
        const initAutocomplete = async () => {
            await loadGoogleMaps(GOOGLE_MAPS_API_KEY);

            const el = elRef.current;
            if (!el) return;

            const waitInput = setInterval(() => {
                const input = el.shadowRoot?.querySelector("input");
                if (!input) return;

                clearInterval(waitInput);
                el.setAttribute("placeholder", "Nhập địa điểm");

                const handlePlaceChange = (event) => {
                    const place = event.detail;
                    if (!place?.geometry) return;

                    onPlaceSelect?.({
                        formattedAddress: place.formattedAddress || "",
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                        locationName: place.displayName || place.formattedAddress || "Địa điểm",
                    });
                };

                el.addEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);

                // Cleanup
                return () => {
                    el.removeEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);
                };
            }, 100);
        };

        initAutocomplete();
    }, [onPlaceSelect]);

    return (
        <gmpx-place-autocomplete
            ref={elRef}
            lang="vi"
            style={{
                width: "100%",
                display: "block",
                padding: "8px",
                borderBottom: "1px solid #ccc",
            }}
        />
    );
});

export default PlaceAutocomplete;
