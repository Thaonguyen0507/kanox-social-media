import React, { useState } from "react";

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

function AutocompleteInput({ onPlaceSelected }) {
    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState("");

    const handleInputChange = async (e) => {
        const input = e.target.value;
        setQuery(input);

        if (!input) return setSuggestions([]);

        const res = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                input
            )}&key=${GOOGLE_API_KEY}&language=vi`
        );

        const data = await res.json();
        if (data.status === "OK") {
            setSuggestions(data.predictions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = async (placeId, description) => {
        setQuery(description);
        setSuggestions([]);

        const res = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}&language=vi`
        );
        const data = await res.json();

        if (data.status === "OK") {
            const place = data.result;
            const location = place.geometry.location;

            onPlaceSelected({
                address: place.formatted_address,
                lat: location.lat,
                lng: location.lng,
            });
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Nhập địa điểm"
                className="form-control"
            />
            {suggestions.length > 0 && (
                <ul
                    style={{
                        position: "absolute",
                        background: "#fff",
                        border: "1px solid #ccc",
                        width: "100%",
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    {suggestions.map((sug) => (
                        <li
                            key={sug.place_id}
                            style={{ padding: "5px", cursor: "pointer" }}
                            onClick={() => handleSelect(sug.place_id, sug.description)}
                        >
                            {sug.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AutocompleteInput;
