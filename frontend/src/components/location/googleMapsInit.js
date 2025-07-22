let isDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isDefined) {
        console.log("⚠️ Đã define rồi, bỏ qua");
        return;
    }

    console.log("⏳ Đợi window.google.maps.importLibrary...");
    await new Promise((resolve) => {
        if (window.google?.maps?.importLibrary) return resolve();

        const interval = setInterval(() => {
            if (window.google?.maps?.importLibrary) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });

    try {
        const { PlaceAutocompleteElement } =
            await window.google.maps.importLibrary("places");

        if (!customElements.get("gmpx-place-autocomplete")) {
            customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
            console.log("✅ gmpx-place-autocomplete defined.");
        } else {
            console.log("⚠️ gmpx-place-autocomplete đã tồn tại");
        }

        isDefined = true;
    } catch (error) {
        console.error("❌ Lỗi importLibrary:", error);
    }
};
