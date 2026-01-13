import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Phone, Navigation, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Hospital {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  international_phone_number?: string;
  distance?: number; // in meters
}

interface NearbyHospitalsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const NearbyHospitals = ({ isOpen, onOpenChange }: NearbyHospitalsProps) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { toast } = useToast();

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  useEffect(() => {
    if (!isOpen || mapLoaded) return;

    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.");
      return;
    }

    // Check if script is already loaded
    if ((window as any).google && (window as any).google.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load Google Maps. Please check your API key.");
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isOpen, mapLoaded, GOOGLE_MAPS_API_KEY]);

  // Get user's current location
  const getUserLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  // Find nearby hospitals using Google Places API
  const findNearbyHospitals = useCallback(
    async (location: { lat: number; lng: number }) => {
      const google = (window as any).google;
      if (!google || !google.maps || !google.maps.places) {
        setError("Google Maps API not loaded");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const service = new google.maps.places.PlacesService(
          document.createElement("div")
        );

        const request = {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 10000, // 10km radius
          type: "hospital",
          keyword: "hospital",
        };

        service.nearbySearch(request, (results: any, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const hospitalsList: Hospital[] = results
              .slice(0, 10) // Limit to 10 hospitals
              .map((place: any) => {
                let distance: number | undefined;
                if (place.geometry?.location && google.maps.geometry) {
                  try {
                    distance = google.maps.geometry.spherical.computeDistanceBetween(
                      new google.maps.LatLng(location.lat, location.lng),
                      place.geometry.location
                    );
                  } catch (e) {
                    console.warn("Could not calculate distance:", e);
                  }
                }

                return {
                  place_id: place.place_id || "",
                  name: place.name || "Unknown Hospital",
                  vicinity: place.vicinity,
                  formatted_address: place.formatted_address,
                  geometry: place.geometry
                    ? {
                        location: {
                          lat: typeof place.geometry.location.lat === 'function' 
                            ? place.geometry.location.lat() 
                            : place.geometry.location.lat,
                          lng: typeof place.geometry.location.lng === 'function'
                            ? place.geometry.location.lng()
                            : place.geometry.location.lng,
                        },
                      }
                    : undefined,
                  rating: place.rating,
                  user_ratings_total: place.user_ratings_total,
                  formatted_phone_number: place.formatted_phone_number,
                  international_phone_number: place.international_phone_number,
                  distance: distance,
                };
              })
              .sort((a, b) => (a.distance || 0) - (b.distance || 0)); // Sort by distance

            setHospitals(hospitalsList);
            initializeMap(location, hospitalsList);
          } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setError("No hospitals found nearby. Try expanding your search area.");
          } else {
            setError(`Failed to find hospitals: ${status}`);
          }
          setLoading(false);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search for hospitals");
        setLoading(false);
      }
    },
    []
  );

  // Initialize Google Map
  const initializeMap = useCallback(
    (center: { lat: number; lng: number }, hospitalsList: Hospital[]) => {
      const google = (window as any).google;
      if (!mapRef.current || !google || !google.maps) return;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Create map
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      googleMapRef.current = map;

      // Add user location marker
      new google.maps.Marker({
        position: center,
        map,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      // Add hospital markers
      hospitalsList.forEach((hospital) => {
        if (hospital.geometry) {
          const marker = new google.maps.Marker({
            position: {
              lat: hospital.geometry.location.lat,
              lng: hospital.geometry.location.lng,
            },
            map,
            title: hospital.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${hospital.name}</h3>
                ${hospital.vicinity ? `<p style="margin: 0 0 4px 0; color: #666;">${hospital.vicinity}</p>` : ""}
                ${hospital.distance ? `<p style="margin: 0 0 4px 0; color: #666;">${(hospital.distance / 1000).toFixed(2)} km away</p>` : ""}
                ${hospital.rating ? `<p style="margin: 0; color: #666;">⭐ ${hospital.rating} (${hospital.user_ratings_total || 0} reviews)</p>` : ""}
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        }
      });
    },
    []
  );

  // Handle search for hospitals
  const handleSearchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const location = await getUserLocation();
      setUserLocation(location);
      await findNearbyHospitals(location);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get location";
      setError(errorMessage);
      setLoading(false);
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [getUserLocation, findNearbyHospitals, toast]);

  // Auto-search when dialog opens
  useEffect(() => {
    if (isOpen && mapLoaded && !userLocation && !loading) {
      handleSearchHospitals();
    }
  }, [isOpen, mapLoaded, userLocation, loading, handleSearchHospitals]);

  // Format distance
  const formatDistance = (meters?: number): string => {
    if (!meters) return "Unknown distance";
    if (meters < 1000) return `${Math.round(meters)} m away`;
    return `${(meters / 1000).toFixed(2)} km away`;
  };

  // Get directions
  const getDirections = (hospital: Hospital) => {
    if (!hospital.geometry) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.geometry.location.lat},${hospital.geometry.location.lng}`;
    if (userLocation) {
      window.open(`${url}&origin=${userLocation.lat},${userLocation.lng}`, "_blank");
    } else {
      window.open(url, "_blank");
    }
  };

  // Call hospital
  const callHospital = (phoneNumber?: string) => {
    if (!phoneNumber) {
      toast({
        title: "No phone number",
        description: "Phone number not available for this hospital",
        variant: "default",
      });
      return;
    }
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">Find Nearby Hospitals</DialogTitle>
          <DialogDescription>
            Get directions to the nearest hospitals and medical facilities
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Map Section */}
          <div className="w-full md:w-2/3 h-64 md:h-[500px] relative border-r border-border">
            <div ref={mapRef} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
            {error && !GOOGLE_MAPS_API_KEY && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted p-4">
                <div className="text-center max-w-md">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Google Maps API key not configured.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add VITE_GOOGLE_MAPS_API_KEY to your .env file to enable this feature.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hospitals List */}
          <div className="w-full md:w-1/3 h-64 md:h-[500px] overflow-y-auto p-4 bg-background">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Nearby Hospitals</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSearchHospitals}
                disabled={loading}
                className="h-7 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {loading && hospitals.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && hospitals.length === 0 && !error && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Click "Refresh" to find nearby hospitals
                </p>
              </div>
            )}

            <div className="space-y-3">
              {hospitals.map((hospital) => (
                <Card key={hospital.place_id} className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {hospital.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {hospital.vicinity || hospital.formatted_address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {formatDistance(hospital.distance)}
                      </span>
                      {hospital.rating && (
                        <span className="text-muted-foreground">
                          ⭐ {hospital.rating}
                          {hospital.user_ratings_total && ` (${hospital.user_ratings_total})`}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => getDirections(hospital)}
                        className="flex-1 text-xs h-7"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                      {hospital.formatted_phone_number && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => callHospital(hospital.formatted_phone_number)}
                          className="text-xs h-7"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NearbyHospitals;
