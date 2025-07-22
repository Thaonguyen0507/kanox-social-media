let isPlaceAutocompleteDefined = false;
let definePromise = null;

export const definePlaceAutocomplete = async () => {
    if (isPlaceAutocompleteDefined) return;

    if (definePromise) return definePromise;

    definePromise = new Promise(async (resolve, reject) => {
        try {
            if (!window.google?.maps?.importLibrary) {
                const wait = () => new Promise((res) => {
                    const interval = setInterval(() => {
                        if (window.google?.maps?.importLibrary) {
                            clearInterval(interval);
                            res();
                        }
                    }, 100);
                });
                await wait();
            }

            const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

            // ✅ Sử dụng try/catch để tránh throw nếu đã define
            try {
                if (!customElements.get("gmpx-place-autocomplete")) {
                    customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
                    console.log("✅ gmpx-place-autocomplete đã được define");
                } else {
                    console.log("ℹ️ gmpx-place-autocomplete đã được define trước đó");
                }
            } catch (err) {
                console.warn("⚠️ Có thể đã define rồi:", err.message);
            }

            isPlaceAutocompleteDefined = true;
            resolve();
        } catch (err) {
            console.error("❌ Lỗi khi define gmpx-place-autocomplete:", err);
            reject(err);
        }
    });

    return definePromise;
};
