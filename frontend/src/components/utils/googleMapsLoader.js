import { PlaceAutocompleteElement } from "@googlemaps/places";

export const definePlaceAutocomplete = () => {
    if (!customElements.get("gmpx-place-autocomplete")) {
        customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
    }
};

export const loadGoogleMaps = async (apiKey) => {
    if (window.google?.maps) return;

    await import(
        /* webpackIgnore: true */
        `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=places&modules=place_autocomplete`
        );
    definePlaceAutocomplete();
};
