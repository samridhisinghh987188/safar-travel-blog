import { useEffect, useState } from "react";

export default function LocationInfo({
  location,
  pixabayApiKey = "52371859-85c6793529fcdd89bb386f5b2",
}) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      if (location.name) {
        fetchPlaces(location.name);
      } else {
        reverseGeocodeAndFetch(location.lat, location.lng);
      }
    } else {
      setPlaces([]);
    }
  }, [location]);

  // Reverse geocode lat/lng to location name
  const reverseGeocodeAndFetch = async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const name = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Tourist Spot";
      fetchPlaces(name);
    } catch (e) {
      setError("Failed to fetch location info");
      setPlaces(getMockPlaces("Unknown"));
      setLoading(false);
    }
  };

  const fetchPlaces = async (locationName) => {
    setLoading(true);
    setError(null);
    try {
      const searchTerm = extractLocationName(locationName);
      const response = await fetch(
        `https://pixabay.com/api/?key=${pixabayApiKey}&q=${encodeURIComponent(
          `${searchTerm} travel landmark tourism`
        )}&image_type=photo&category=places&min_width=400&per_page=5&safesearch=true&order=popular`
      );

      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.hits && data.hits.length > 0) {
        const images = data.hits.slice(0, 3).map((hit) => ({
          image: hit.webformatURL,
        }));
        setPlaces(images);
      } else {
        setPlaces(getMockPlaces(locationName));
      }
    } catch (error) {
      console.error(error);
      setError("Failed to load images");
      setPlaces(getMockPlaces(locationName));
    } finally {
      setLoading(false);
    }
  };

  const extractLocationName = (fullName) => {
    const parts = fullName.split(",");
    if (parts.length >= 2) {
      return parts[0].trim();
    }
    return fullName.split(" ").slice(0, 2).join(" ");
  };

  const getMockPlaces = (locationName) => {
    const cleanName = extractLocationName(locationName);
    return [
      {
        image: `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(
          cleanName + " historic center"
        )}`,
      },
      {
        image: `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(
          cleanName + " tourist attraction"
        )}`,
      },
      {
        image: `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(
          cleanName + " scenic landscape"
        )}`,
      },
    ];
  };

  if (!location) {
    return (
      <div className="h-full flex items-center justify-center">
      {/* <p className="text-muted-foreground">Click on the map to explore a location</p> */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-[220px]" style={{ gap: 0 }}>
      {error && (
        <div className="text-center text-destructive py-2">
          <p className="text-xs">{error}</p>
        </div>
      )}

      {loading ? (
        [1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted animate-pulse"
            style={{ flex: 1, width: "100%" }}
          />
        ))
      ) : places.length > 0 ? (
        places.map((place, i) => (
          <img
            key={i}
            src={place.image}
            alt={`Scenic view ${i}`}
            loading="lazy"
            className="object-cover"
            style={{
              flex: 1,
              width: "100%",
              display: "block",
              zIndex: 1,
              opacity: 1,
            }}
          />
        ))
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-xs">No images available</p>
        </div>
      )}
    </div>
  );
}
