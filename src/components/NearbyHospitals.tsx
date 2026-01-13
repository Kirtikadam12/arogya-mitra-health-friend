import { useState, useEffect, useCallback } from "react";
import { MapPin, Phone, Navigation, Loader2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Hospital {
  place_id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  distance?: number; // in meters
  phone?: string;
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
  const { toast } = useToast();

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

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

  // Search for hospitals using Overpass API (OpenStreetMap - FREE, no API key needed)
  const findNearbyHospitals = useCallback(
    async (location: { lat: number; lng: number }) => {
      setLoading(true);
      setError(null);

      try {
        // Use Overpass API to search for hospitals within 10km radius
        // Simplified query for better reliability
        const radius = 10000; // 10km in meters
        const overpassQuery = `
          [out:json][timeout:15];
          (
            node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
            node["amenity"="clinic"](around:${radius},${location.lat},${location.lng});
            node["healthcare"="hospital"](around:${radius},${location.lat},${location.lng});
            node["healthcare"="clinic"](around:${radius},${location.lat},${location.lng});
            node["healthcare"="doctor"](around:${radius},${location.lat},${location.lng});
          );
          out body;
        `;

        // Try multiple Overpass API servers for reliability
        const overpassServers = [
          "https://overpass-api.de/api/interpreter",
          "https://overpass.kumi.systems/api/interpreter",
          "https://overpass.openstreetmap.ru/api/interpreter",
        ];

        let data: any = null;
        let lastError: Error | null = null;

        for (const server of overpassServers) {
          try {
            const response = await fetch(server, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `data=${encodeURIComponent(overpassQuery)}`,
              signal: AbortSignal.timeout(20000), // 20 second timeout
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            data = await response.json();
            
            // Check if response has error
            if (data.error) {
              throw new Error(data.error);
            }
            
            // Success - break out of loop
            break;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`Overpass server ${server} failed:`, lastError.message);
            // Try next server
            continue;
          }
        }

        if (!data) {
          throw lastError || new Error("All Overpass API servers failed. Please try again later.");
        }

        const elements = data.elements || [];

        // Transform OpenStreetMap data to our Hospital format
        const hospitalsList: Hospital[] = elements
          .map((element: any, index: number) => {
            const lat = element.lat || element.center?.lat;
            const lng = element.lon || element.center?.lon;
            
            if (!lat || !lng) return null;

            const distance = calculateDistance(location.lat, location.lng, lat, lng);
            const name = element.tags?.name || element.tags?.["name:en"] || `Hospital ${index + 1}`;
            const address = element.tags?.["addr:full"] || 
                          `${element.tags?.["addr:street"] || ""} ${element.tags?.["addr:city"] || ""}`.trim() ||
                          element.tags?.["addr:housenumber"] || "";

            return {
              place_id: element.id?.toString() || `osm-${index}`,
              name,
              address: address || undefined,
              lat,
              lng,
              distance,
              phone: element.tags?.["contact:phone"] || element.tags?.phone,
            };
          })
          .filter((h: Hospital | null): h is Hospital => h !== null)
          .sort((a: Hospital, b: Hospital) => (a.distance || 0) - (b.distance || 0))
          .slice(0, 20); // Limit to 20 hospitals

        if (hospitalsList.length === 0) {
          setError("No hospitals found nearby. Try expanding your search area or check your location.");
        } else {
          setHospitals(hospitalsList);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to search for hospitals";
        console.error("Hospital search error:", err);
        setError(errorMessage);
        toast({
          title: "Search Error",
          description: errorMessage + ". Please try again or check your internet connection.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
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
        description: errorMessage + ". Please allow location access and try again.",
        variant: "destructive",
      });
    }
  }, [getUserLocation, findNearbyHospitals, toast]);

  // Auto-search when dialog opens
  useEffect(() => {
    if (isOpen && !userLocation && !loading) {
      handleSearchHospitals();
    }
  }, [isOpen, userLocation, loading, handleSearchHospitals]);

  // Format distance
  const formatDistance = (meters?: number): string => {
    if (!meters) return "Unknown distance";
    if (meters < 1000) return `${Math.round(meters)} m away`;
    return `${(meters / 1000).toFixed(2)} km away`;
  };

  // Get directions (opens in Google Maps or OpenStreetMap)
  const getDirections = (hospital: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
    if (userLocation) {
      window.open(`${url}&origin=${userLocation.lat},${userLocation.lng}`, "_blank");
    } else {
      window.open(url, "_blank");
    }
  };

  // Open in OpenStreetMap
  const openInOSM = (hospital: Hospital) => {
    window.open(`https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lng}&zoom=15`, "_blank");
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">Find Nearby Hospitals</DialogTitle>
          <DialogDescription>
            Get directions to the nearest hospitals and medical facilities
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="px-6 pb-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {userLocation 
                  ? `Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : "Getting your location..."}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchHospitals}
              disabled={loading}
              className="h-8 text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Hospitals List */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            {loading && hospitals.length === 0 && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Searching for nearby hospitals...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                    {error.includes("Location access denied") && (
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Tip: Click the lock icon in your browser's address bar and allow location access, then click "Refresh".
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!loading && hospitals.length === 0 && !error && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">
                  No hospitals found yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Click "Refresh" to search for nearby hospitals
                </p>
              </div>
            )}

            <div className="space-y-3">
              {hospitals.map((hospital) => (
                <Card key={hospital.place_id} className="border-border hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {hospital.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {hospital.address || `${hospital.lat.toFixed(4)}, ${hospital.lng.toFixed(4)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        {formatDistance(hospital.distance)}
                      </span>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInOSM(hospital)}
                        className="text-xs h-7"
                        title="View on OpenStreetMap"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      {hospital.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => callHospital(hospital.phone)}
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
