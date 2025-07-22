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

            // Gán placeholder
            el.setAttribute("placeholder", "Nhập địa điểm");

            // Log trạng thái
            console.log("🧩 customElements.get:", customElements.get("gmpx-place-autocomplete"));
            console.log("🌐 window.google.maps:", window.google?.maps);
            console.log("📌 Đã mount gmpx-place-autocomplete:", el);

            const handlePlaceChange = (event) => {
                const place = event.detail;
                console.log("📍 Đã chọn địa điểm:", place);

                if (place?.geometry) {
                    const lat = place.geometry.location.lat;
                    const lng = place.geometry.location.lng;
                    const name = place.formattedAddress || place.displayName || "";

                    const result = {
                        ...place,
                        formattedAddress: name,
                        latitude: lat,
                        longitude: lng,
                    };

                    console.log("📦 Dữ liệu sau xử lý:", result);
                    onPlaceSelect?.(result);
                } else {
                    console.warn("⚠️ Không có geometry trong địa điểm được chọn.");
                }
            };

            el.addEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);

            return () => {
                el.removeEventListener("gmpx-placeautocomplete:placechanged", handlePlaceChange);
            };
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
