import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
});

const x = L.divIcon({
  html: '<span style="font-size: 2rem;">💩</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
  className: ""
});

const LIBRARIES = [
  { name: "East Asian Library", coords: [37.8736, -122.2600] },
  { name: "Music Library",      coords: [37.8704, -122.2562] },
  { name: "Doe Library",        coords: [37.8722, -122.2592] },
  { name: "Grimes Hall",        coords: [37.8753, -122.2576] },
];

export default function Mapper() {
  const [averages, setAverages] = useState({});

  useEffect(() => {
    fetch("http://localhost:2024/get-users")
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        data.results.forEach((row) => {
          if (!grouped[row.location]) grouped[row.location] = [];
          grouped[row.location].push(Number(row.rating));
        });
        const calculated = {};
        Object.keys(grouped).forEach((loc) => {
          const ratings = grouped[loc];
          calculated[loc] = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
        });
        setAverages(calculated);
      });
  }, []);

  return (
    <MapContainer center={[37.8712, -122.2555]} zoom={17} scrollWheelZoom={true} style={{ height: "700px", width: "50%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {LIBRARIES.map((lib) => (
        <Marker key={lib.name} position={lib.coords} icon={x}>
          <Popup>{lib.name}: {averages[lib.name] ? `${averages[lib.name]} ` : "No ratings yet"}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}