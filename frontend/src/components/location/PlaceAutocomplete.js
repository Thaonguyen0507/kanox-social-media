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

            // Delay để tránh lỗi shadow DOM chưa sẵn sàng
            setTimeout(() => {
                el.setAttribute("placeholder", "Nhập địa điểm");
                console.log("📌 Element:", el);

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
            }, 100); // 👈 Thêm delay ngắn để đảm bảo shadow DOM ready
        });
    }, [onPlaceSelect]);


    return (
        <>
            {console.log("✅ Đã render gmpx-place-autocomplete")}
            <gmpx-place-autocomplete
                ref={elRef}
                style={{
                    width: "100%",
                    display: "block",
                    borderBottom: "1px solid #ccc",
                    padding: "8px",
                }}
            />
        </>
    );

});

export default PlaceAutocomplete;
