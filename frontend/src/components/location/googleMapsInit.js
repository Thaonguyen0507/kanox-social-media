let isDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isDefined) return;

    if (!window.google?.maps?.importLibrary) {
        console.error("❌ importLibrary không khả dụng.");
        return;
    }

    const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

    if (!customElements.get("gmpx-place-autocomplete")) {
        customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
        console.log("✅ gmpx-place-autocomplete đã được define.");
    } else {
        console.log("⚠️ gmpx-place-autocomplete đã tồn tại.");
    }

    isDefined = true;
};
