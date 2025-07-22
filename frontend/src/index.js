    import React from "react";
    import ReactDOM from "react-dom/client";
    import "bootstrap/dist/css/bootstrap.min.css";
    import "bootstrap-icons/font/bootstrap-icons.css";
    import "./index.css"; // Đặt sau Bootstrap
    import App from "./App";
    import reportWebVitals from "./reportWebVitals";
    import { GoogleOAuthProvider } from "@react-oauth/google";
    
    // Polyfill process
    import process from 'process';
    window.process = process;

    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCH8eUqefKzCsoIhXQeE2Oe-P25itPiRZw&v=weekly&libraries=places";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    if (!root) {
        console.error("Root element not found");
        throw new Error("Root element not found");
    }

    root.render(
        <React.StrictMode>
            <GoogleOAuthProvider clientId="169927075241-2bls9jare84nfak44e777ish524o5avk.apps.googleusercontent.com">
                <App />
            </GoogleOAuthProvider>
        </React.StrictMode>
    );

    reportWebVitals();