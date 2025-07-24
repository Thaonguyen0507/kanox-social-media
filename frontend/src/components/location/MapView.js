function MapView({ lat, lng }) {
    if (!lat || !lng) return null;

    const mapUrl = `https://maps.goong.io/maps/embed?api_key=${process.env.REACT_APP_GOONG_MAPS_API_KEY}&center=${lat},${lng}&zoom=15`;

    return (
        <div className="mt-3">
            <iframe
                title="Goong Map"
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
