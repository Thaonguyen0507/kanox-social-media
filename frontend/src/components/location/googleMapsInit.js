let isDefined = false;

export const definePlaceAutocomplete = async () => {
    if (isDefined) return;

    // Đợi Google Maps có importLibrary
    await new Promise((resolve) => {
        if (window.google?.maps?.importLibrary) return resolve();

        const interval = setInterval(() => {
            if (window.google?.maps?.importLibrary) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });

    const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");

    if (!customElements.get("gmpx-place-autocomplete")) {
        customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
        console.log("✅ gmpx-place-autocomplete defined.");
    }

    isDefined = true;
};
