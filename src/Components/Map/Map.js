import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { fetchAverages } from "../../utils/averages";

L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
});

const x = L.divIcon({
  html: '<span style="font-size: 2rem;">💩</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
  className: "",
});

const LIBRARIES = [
  { name: "East Asian Library", coords: [37.8736, -122.26] },
  { name: "Music Library", coords: [37.8704, -122.2562] },
  { name: "Doe Library", coords: [37.8722, -122.2592] },
  { name: "Grimes Hall", coords: [37.8753, -122.2576] },
];

export default function Mapper({ refreshKey }) {
  const [averages, setAverages] = useState({});

  useEffect(() => {
    fetchAverages()
      .then(setAverages)
      .catch((err) => console.error(err));
  }, [refreshKey]);

  return (
    <MapContainer
      center={[37.8712, -122.2555]}
      zoom={17}
      scrollWheelZoom={true}
      style={{ height: "700px", width: "50%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {LIBRARIES.map((lib) => (
        <Marker key={lib.name} position={lib.coords} icon={x}>
          <Popup>
            {lib.name}:{" "}
            {averages[lib.name] ? `${averages[lib.name]} / 5` : "No ratings yet"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
