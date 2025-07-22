let isDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isDefined) {
        console.log("ℹ️ gmpx-place-autocomplete đã define (biến cờ)");
        return;
    }

    if (customElements.get("gmpx-place-autocomplete")) {
        console.warn("⚠️ gmpx-place-autocomplete đã được define trong registry");
        isDefined = true;
        return;
    }

    // Đảm bảo importLibrary có sẵn
    if (!window.google?.maps?.importLibrary) {
        console.log("⏳ Chờ window.google.maps.importLibrary...");
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
        customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
        isDefined = true;
        console.log("✅ gmpx-place-autocomplete đã define thành công");
    } catch (err) {
        console.error("❌ Lỗi define gmpx-place-autocomplete:", err);
    }
};
