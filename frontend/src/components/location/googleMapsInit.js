let isDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isDefined || customElements.get("gmpx-place-autocomplete")) {
        console.log("⚠️ gmpx-place-autocomplete đã define, bỏ qua.");
        return;
    }

    try {
        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

        // Định nghĩa custom element nếu chưa có
        customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
        console.log("✅ gmpx-place-autocomplete defined.");

        isDefined = true;
    } catch (error) {
        if (error instanceof DOMException && error.name === "NotSupportedError") {
            console.warn("⚠️ Element đã được define bằng constructor khác.");
        } else {
            console.error("❌ Lỗi define:", error);
        }
    }
};
