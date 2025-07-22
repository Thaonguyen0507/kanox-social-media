import React, { useEffect, useRef } from "react";

const PlaceAutocomplete = ({ onPlaceSelect }) => {
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error("Google Maps chưa sẵn sàng.");
            return;
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
                types: ["geocode"],
                componentRestrictions: { country: [] }, // <-- BỎ VN nếu bạn không chắc
            }
        );

        autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current.getPlace();

            if (!place || !place.geometry) {
                console.warn("Không có thông tin địa điểm.");
                return;
            }

            const result = {
                formattedAddress: place.formatted_address || "",
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
            };

            onPlaceSelect?.(result);
        });
    }, [onPlaceSelect]);

    return (
        <input
            ref={inputRef}
            type="text"
            placeholder="Nhập địa điểm"
            className="form-control"
        />
    );
};

export default PlaceAutocomplete;
