import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

const loadGoogleMaps = () =>
    new Promise((resolve, reject) => {
        if (window.google?.maps?.importLibrary) return resolve();

        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCH8eUqefKzCsoIhXQeE2Oe-P25itPiRZw&v=beta&libraries=places&modules=place_autocomplete";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

const defineGMPX = async () => {
    if (customElements.get("gmpx-place-autocomplete")) {
        console.log("⚠️ gmpx-place-autocomplete đã được define.");
        return;
    }

    try {
        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");
        customElements.define("gmpx-place-autocomplete", PlaceAutocompleteElement);
        console.log("✅ gmpx-place-autocomplete defined.");
    } catch (error) {
        if (error instanceof DOMException && error.name === "NotSupportedError") {
            console.warn("⚠️ Constructor đã được sử dụng trước đó. Bỏ qua.");
        } else {
            console.error("❌ Lỗi define:", error);
        }
    }
};

loadGoogleMaps()
    .then(defineGMPX)
    .then(() => {
        const root = ReactDOM.createRoot(document.getElementById("root"));
        root.render(
            <React.StrictMode>
                <GoogleOAuthProvider clientId="169927075241-2bls9jare84nfak44e777ish524o5avk.apps.googleusercontent.com">
                    <App />
                </GoogleOAuthProvider>
            </React.StrictMode>
        );
    });

reportWebVitals();
