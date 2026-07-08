import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem'
};

// Replace these coordinates with your shop's actual location
const center = {
  lat: 23.8103, // Latitude (Example: Dhaka)
  lng: 90.4125  // Longitude (Example: Dhaka)
};

export default function MapComponent() {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Make sure this is in your .env

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
      >
        {/* The marker showing your shop */}
        <Marker position={center} title="Our Shop Location" />
      </GoogleMap>
    </LoadScript>
  );
}