import React, { useEffect, useRef, forwardRef } from "react";
import { definePlaceAutocomplete } from "./googleMapsInit";

const PlaceAutocomplete = forwardRef(({ onPlaceSelect }, ref) => {
    const internalRef = useRef(null);
    const elRef = ref || internalRef;

    useEffect(() => {
        definePlaceAutocomplete().then(() => {
            const el = elRef.current;
            if (!el) {
                console.warn("⛔ Không tìm thấy ref tới <gmpx-place-autocomplete>");
                return;
            }

            // ⚠️ Đợi shadow DOM render xong
            const waitForInput = setInterval(() => {
                const input = el.shadowRoot?.querySelector("input");
                if (!input) return;

                clearInterval(waitForInput);
                console.log("✅ Shadow input đã sẵn sàng:", input);

                // Gán placeholder
                el.setAttribute("placeholder", "Nhập địa điểm");

                // Sự kiện chọn địa điểm
                const handlePlaceChange = (event) => {
                    const place = event.detail;
                    console.log("📍 Đã chọn địa điểm:", place);

                    if (!place?.geometry) return;

                    onPlaceSelect?.({
                        ...place,
                        formattedAddress: place.formattedAddress || "",
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                    });
                };

                el.addEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);

                // Clean up
                return () => {
                    el.removeEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);
                };
            }, 100);
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
        />
    );
});

export default PlaceAutocomplete;
