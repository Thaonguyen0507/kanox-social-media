let isPlaceAutocompleteDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isPlaceAutocompleteDefined) {
        console.log("✅ gmpx-place-autocomplete đã được define");
        return;
    }

    try {
        if (!window.google?.maps?.importLibrary) {
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (window.google?.maps?.importLibrary) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
        }

        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

        if (!customElements.get("gmpx-place-autocomplete")) {
            customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
            console.log("✅ gmpx-place-autocomplete đã được define thành công");
        } else {
            console.warn("⚠️ gmpx-place-autocomplete đã define trước đó");
        }

        isPlaceAutocompleteDefined = true;
    } catch (error) {
        console.error("❌ Lỗi define gmpx-place-autocomplete:", error);
    }
};
