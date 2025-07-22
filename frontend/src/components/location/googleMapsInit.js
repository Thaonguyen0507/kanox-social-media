let isPlaceAutocompleteDefined = false; // 🔁 Chặn define nhiều lần

export const definePlaceAutocomplete = async () => {
    if (isPlaceAutocompleteDefined) {
        console.log("ℹ️ gmpx-place-autocomplete already defined (skipped)");
        return;
    }

    // Chờ window.google.maps.importLibrary sẵn sàng
    if (!window.google?.maps?.importLibrary) {
        console.log("⏳ Waiting for window.google.maps.importLibrary...");
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (window.google?.maps?.importLibrary) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    try {
        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

        if (!customElements.get("gmpx-place-autocomplete")) {
            customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
            console.log("✅ gmpx-place-autocomplete defined successfully");
        } else {
            console.log("⚠️ gmpx-place-autocomplete already defined in registry");
        }

        isPlaceAutocompleteDefined = true;
    } catch (err) {
        console.error("❌ Error defining gmpx-place-autocomplete:", err);
    }
};
