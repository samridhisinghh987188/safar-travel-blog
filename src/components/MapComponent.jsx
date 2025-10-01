import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapComponentOriginal from "@/components/map-component";
import LocationInfo from "@/components/location-info";

const MapComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setSearchTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={`${import.meta.env.BASE_URL}Videos/mapcomponentmotion.mp4`}
        style={{ 
          transform: 'translateZ(0)',
          imageRendering: 'pixelated',
          WebkitTransform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content container - full page version */}
      <div className="relative z-10 w-full h-full flex items-center justify-end px-4">
        {/* Outer wrapper with map and image side by side */}
        <div className="relative w-full max-w-[1100px] flex items-start">
          {/* Map Container - fixed width */}
          <div className="relative w-[800px] h-[500px]">
            <MapComponentOriginal
              onLocationSelect={handleLocationSelect}
              searchQuery={searchQuery}
              searchTrigger={searchTrigger}
            />

            {/* Search bar at bottom of map */}
            <form
              onSubmit={handleSearch}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for places to explore..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 py-3 text-base rounded-full border-2 border-gray-300 focus:border-blue-400 shadow-md bg-white bg-opacity-90 text-black"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedLocation(null);
                    }}
                    className="absolute right-20 top-1/2 transform -translate-y-1/2 rounded-full p-2 text-black"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-5 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </div>
            </form>
          </div>

          {/* Image section on the right side */}
          <div className="hidden lg:block w-[240px] h-[500px] flex-shrink-0 ml-8">
            <LocationInfo location={selectedLocation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
