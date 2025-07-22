let isDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isDefined) {
        console.log("⚠️ Đã define rồi, bỏ qua");
        return;
    }

    console.log("⏳ Chờ window.google.maps.importLibrary...");
    await new Promise((resolve) => {
        if (window.google?.maps?.importLibrary) {
            console.log("✅ importLibrary SẴN SÀNG ngay lập tức");
            return resolve();
        }

        const interval = setInterval(() => {
            if (window.google?.maps?.importLibrary) {
                clearInterval(interval);
                console.log("✅ importLibrary đã sẵn sàng sau polling");
                resolve();
            }
        }, 100);
    });

    console.log("➡️ Gọi importLibrary('places')...");
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
