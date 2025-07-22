import React, { useEffect, useRef, forwardRef } from "react";

const PlaceAutocomplete = forwardRef(({ onPlaceSelect }, ref) => {
    const internalRef = useRef(null);
    const elRef = ref || internalRef;

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const interval = setInterval(() => {
            const input = el.shadowRoot?.querySelector("input");
            if (!input) return;

            clearInterval(interval);
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

            return () => {
                el.removeEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);
            };
        }, 100);
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
