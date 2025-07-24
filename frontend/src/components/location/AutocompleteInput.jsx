import React, { useState } from "react";

const GOONG_API_KEY = process.env.REACT_APP_GOONG_MAPS_API_KEY;

function AutocompleteInput({ onPlaceSelected }) {
    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState("");

    const handleInputChange = async (e) => {
        const input = e.target.value;
        setQuery(input);
        if (!input) return setSuggestions([]);

        const res = await fetch(
            `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(input)}`
        );
        const data = await res.json();

        if (data.predictions) {
            setSuggestions(data.predictions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = async (placeId, description) => {
        setQuery(description);
        setSuggestions([]);

        const res = await fetch(
            `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`
        );
        const data = await res.json();
        if (data.result) {
            const location = data.result.geometry.location;
            onPlaceSelected({
                locationName: data.result.formatted_address,
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
