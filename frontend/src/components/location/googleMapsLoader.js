// location/googleMapsLoader.js
let isLoaded = false;

export const loadGoogleMapsScript = (apiKey) => {
    return new Promise((resolve, reject) => {
        if (isLoaded) return resolve();

        if (document.querySelector('script[data-id="google-maps"]')) {
            isLoaded = true;
            return resolve();
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places`;
        script.async = true;
        script.defer = true;
        script.dataset.id = "google-maps";

        script.onload = () => {
            isLoaded = true;
            resolve();
        };

        script.onerror = (err) => reject(err);

        document.head.appendChild(script);
    });
};
