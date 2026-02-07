// src/MapComponent.jsx
/**
 * 地図コンポーネント
 * 再利用可能な Leaflet 地図コンポーネント。
 * マーカー付きの地図を表示します。
 */
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// 指示に従って leaflet.css のインポートを削除しました

// React-Leaflet でのデフォルトマーカーアイコンの修正
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ center = [35.681236, 139.767125], zoom = 7, markers = [] }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "600px", width: "100%" }} // 視認性のために最小限のスタイルを維持
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.position}>
          {marker.popup && <Popup>{marker.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
