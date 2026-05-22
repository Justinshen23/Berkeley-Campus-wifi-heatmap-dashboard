import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { fetchAverages } from "../../utils/averages";
import { CAMPUS_LOCATIONS } from "../../data/campusLocations";

const defaultMarkerIcon = L.icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Mapper({ refreshKey }) {
  const [averages, setAverages] = useState({});

  useEffect(() => {
    fetchAverages()
      .then(setAverages)
      .catch((err) => console.error(err));
  }, [refreshKey]);

  return (
    <MapContainer
      center={[37.8725, -122.257]}
      zoom={16}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {CAMPUS_LOCATIONS.map((location) => (
        <Marker
          key={location.name}
          position={location.coords}
          icon={defaultMarkerIcon}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {averages[location.name]
              ? `Average: ${averages[location.name]} / 5`
              : "No ratings yet"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
