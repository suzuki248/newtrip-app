// src/features/navigation/DirectionsMap.jsx
/**
 * Directions Map Component
 * A Google Maps wrapper using the DirectionsService to plot routes.
 * 
 * NOTE: This is an alternative to DirectionsComponent which uses Leaflet.
 * It strictly uses Google Maps API.
 */
import React, { useEffect, useRef, useState } from "react";

const DirectionsMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    if (!window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.681236, lng: 139.767125 },
      zoom: 13,
    });
    setMap(mapInstance);

    const renderer = new window.google.maps.DirectionsRenderer();
    renderer.setMap(mapInstance);
    setDirectionsRenderer(renderer);
  }, []);

  useEffect(() => {
    if (!map || !directionsRenderer) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: "Tokyo Station",
        destination: "Shinjuku Station",
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          // alert("Route failed: " + status);
          console.error("Route failed: " + status);
        }
      }
    );
  }, [map, directionsRenderer]);

  return <div ref={mapRef} style={{ height: "500px", width: "100%" }} />;
};

export default DirectionsMap;
