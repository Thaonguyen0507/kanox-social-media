// location/googleMapsInit.js
import { loadGoogleMapsScript } from "./googleMapsLoader";

let isDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isDefined || customElements.get("gmpx-place-autocomplete")) {
        console.log("✅ gmpx-place-autocomplete already defined (skipped)");
        return;
    }

    try {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            throw new Error("❌ Missing Google Maps API Key in env");
        }

        await loadGoogleMapsScript(apiKey);

        if (!window.google?.maps?.importLibrary) {
            throw new Error("❌ window.google.maps.importLibrary not available");
        }

        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

        // 💡 Kiểm tra constructor đã define chưa (tránh lỗi NotSupportedError)
        const alreadyDefined = [...customElements.getNames()]
            .includes("gmpx-place-autocomplete");

        if (!alreadyDefined) {
            customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
            console.log("✅ gmpx-place-autocomplete defined successfully");
            isDefined = true;
        } else {
            console.warn("⚠️ gmpx-place-autocomplete already registered, skip define");
        }
    } catch (err) {
        console.error("❌ Error in definePlaceAutocomplete:", err);
    }
};
