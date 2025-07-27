import React, { useState, useEffect } from "react";

const GOONG_API_KEY = process.env.REACT_APP_GOONG_MAPS_API_KEY;

function AutocompleteInput({ onPlaceSelected, value }) {
    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    const handleInputChange = async (e) => {
        const input = e.target.value;
        setQuery(input);
        if (!input) {
            setSuggestions([]);
            onPlaceSelected(null); // Xóa thông tin địa điểm khi input trống
            return;
        }

        try {
            const res = await fetch(
                `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(input)}`
            );
            const data = await res.json();
            console.log("Autocomplete API response:", data); // Debug API response

            if (data.predictions) {
                setSuggestions(data.predictions);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching autocomplete suggestions:", error);
            setSuggestions([]);
        }
    };

    const handleSelect = async (placeId, description) => {
        setQuery(description);
        setSuggestions([]);

        try {
            const res = await fetch(
                `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`
            );
            const data = await res.json();
            console.log("Place Detail API response:", data); // Debug API response

            if (data.result && data.result.geometry && data.result.geometry.location) {
                const location = data.result.geometry.location;
                const address = data.result.formatted_address || description; // Fallback to description if formatted_address is null
                onPlaceSelected({
                    address: address,
                    lat: location.lat,
                    lng: location.lng,
                });
            } else {
                console.error("Invalid place details:", data);
                onPlaceSelected(null);
            }
        } catch (error) {
            console.error("Error fetching place details:", error);
            onPlaceSelected(null);
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
