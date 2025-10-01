import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "./theme-provider";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 10);
    }
  }, [lat, lng, map]);

  return null;
}

function MapComponent({ searchQuery, searchTrigger, onLocationSelect }) {
  const { theme } = useTheme();
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default: India
  const [markerPos, setMarkerPos] = useState(null);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';

  useEffect(() => {
    if (!searchQuery) return;

    const controller = new AbortController();

    async function geocode() {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          setCenter({ lat, lng: lon });
          setMarkerPos({ lat, lng: lon });

          if (onLocationSelect) {
            onLocationSelect({ lat, lng: lon, name: searchQuery });
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Geocoding failed:", e);
        }
      }
    }

    geocode();

    return () => controller.abort();
  }, [searchQuery, searchTrigger, onLocationSelect]);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMarkerPos({ lat, lng });
    if (onLocationSelect) {
      onLocationSelect({ lat, lng, name: null });
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "400px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: isDark ? "#1a202c" : "#fff",
        border: "none",  // Remove border if any
        boxShadow: "none", // Remove shadow if any
      }}
    >
      <div style={{ position: "relative", zIndex: 1, height: "100%", width: "100%" }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={5}
          style={{
            height: "100%",
            width: "100%",
            borderRadius: "12px",
            backgroundColor: "transparent", // Make sure background transparent
          }}
          whenCreated={(map) => {
            map.on("click", handleMapClick);
          }}
          className="leaflet-container"
        >
          <TileLayer attribution={tileAttribution} url={tileUrl} />

          <RecenterMap lat={center.lat} lng={center.lng} />

          {markerPos && (
            <Marker position={[markerPos.lat, markerPos.lng]}>
              <Popup>
                {searchQuery
                  ? `${searchQuery} (${markerPos.lat.toFixed(3)}, ${markerPos.lng.toFixed(3)})`
                  : `Selected Location (${markerPos.lat.toFixed(3)}, ${markerPos.lng.toFixed(3)})`}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Add this global style somewhere in your CSS or Tailwind to remove leaflet container border */}
      <style>
        {`
          .leaflet-container {
            border: none !important;
            background: transparent !important;
          }
        `}
      </style>
    </div>
  );
}

export default MapComponent;
