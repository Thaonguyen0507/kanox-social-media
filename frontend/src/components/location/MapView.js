function MapView({ lat, lng }) {
    if (!lat || !lng) return null;

    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${lat},${lng}&zoom=15`;

    return (
        <div className="mt-3">
            <iframe
                title="map"
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapUrl}
                allowFullScreen
            ></iframe>
        </div>
    );
}

export default MapView;