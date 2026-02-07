// src/features/navigation/DirectionsComponent.jsx
/**
 * Directions Component
 * Handles route searching using Leaflet and Google Gemini API (for fare estimation).
 */
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { geocodeAddress, getRoute, formatDistance, formatDuration, travelModeToProfile } from "../../services/routingService";

// Fix for default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const fareCache = {};

async function callGeminiApi(prompt, model = "gemini-2.5-flash") {
  const contents = [{ role: "user", parts: [{ text: prompt }] }];
  const payload = { contents };
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      `Gemini API Error ${res.status}: ${err.error?.message || JSON.stringify(err)}`
    );
  }
  return res.json();
}

async function generateWithRetry(prompt, model = "gemini-2.5-flash", maxRetries = 3) {
  let delay = 1000;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await callGeminiApi(prompt, model);
    } catch (e) {
      if (e.message.includes("RESOURCE_EXHAUSTED") && i < maxRetries) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      throw e;
    }
  }
}

function FitBounds({ bounds }) {
  const map = useMap();

  React.useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);

  return null;
}

const DirectionsComponent = () => {
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [durationText, setDurationText] = useState("");
  const [distanceText, setDistanceText] = useState("");
  const [moneyPrice, setMoneyPrice] = useState("0円");
  const [searching, setSearching] = useState(false);

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  const handleRouteSearch = async (e) => {
    e.preventDefault();

    setSearching(true);
    setDurationText("");
    setDistanceText("");
    setMoneyPrice("0円");
    setRouteCoordinates([]);
    setStartPoint(null);
    setEndPoint(null);

    try {
      const startCoords = await geocodeAddress(originInput);
      const endCoords = await geocodeAddress(destinationInput);

      setStartPoint(startCoords);
      setEndPoint(endCoords);

      const profile = travelModeToProfile(travelMode);
      const routeData = await getRoute({
        start: startCoords,
        end: endCoords,
        profile: profile
      });

      setDurationText(formatDuration(routeData.duration));
      setDistanceText(formatDistance(routeData.distance));
      setRouteCoordinates(routeData.coordinates);

      if (routeData.bounds) {
        const [minLng, minLat, maxLng, maxLat] = routeData.bounds;
        setMapBounds([[minLat, minLng], [maxLat, maxLng]]);
      }

      const key = `${originInput}|${destinationInput}|${travelMode}`;
      if (fareCache[key]) {
        setMoneyPrice(fareCache[key]);
        setSearching(false);
        return;
      }

      const prompt = `Tell me the fare for traveling from ${originInput} to ${destinationInput} by ${travelMode}. Return only the number in Japanese Yen (JPY) format like "1500". Only number.`;
      try {
        const ai = await generateWithRetry(prompt);
        const txt = ai.candidates[0].content.parts[0].text.trim();
        const price = /^\d+(\.\d+)?$/.test(txt) ? txt + "円" : "計算エラー";
        fareCache[key] = price;
        setMoneyPrice(price);
      } catch (aiErr) {
        console.error("AI error:", aiErr);
        setMoneyPrice("取得失敗");
      }

      setSearching(false);
    } catch (err) {
      console.error("Route search error:", err);
      alert("検索エラー: " + err.message);
      setSearching(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleRouteSearch}>
        <div className="grid">
          <div className="mb-4">
            <label className="block mb-2 font-bold">移動手段</label>
            <select
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value)}
            >
              <option value="DRIVING">車</option>
              <option value="WALKING">徒歩</option>
              <option value="BICYCLING">自転車</option>
              <option value="TRANSIT">公共交通機関</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-bold">出発地</label>
            <input
              type="text"
              placeholder="例: 東京駅"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-bold">目的地</label>
            <input
              type="text"
              placeholder="例: 渋谷駅"
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={searching}
          style={{ width: '100%' }}
        >
          {searching ? "検索中..." : "ルート検索"}
        </button>
      </form>

      {/* Results */}
      {(durationText || distanceText) && (
        <div className="mt-4 p-4 bg-light rounded" style={{ backgroundColor: 'var(--light-color)', borderRadius: 'var(--border-radius)' }}>
          <h3 className="text-center mb-4">ルート情報</h3>
          <div className="grid text-center">
            <div>
              <div className="text-secondary font-bold">所要時間</div>
              <div className="text-xl font-bold">{durationText
                .replace("hours", "時間")
                .replace("hour", "時間")
                .replace("minutes", "分")
                .replace("minute", "分")}
              </div>
            </div>
            <div>
              <div className="text-secondary font-bold">距離</div>
              <div className="text-xl font-bold">{distanceText}</div>
            </div>
            <div>
              <div className="text-secondary font-bold">概算運賃</div>
              <div className="text-xl font-bold text-primary" style={{ color: 'var(--primary-color)' }}>{moneyPrice}</div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="mt-4" style={{ height: "500px", borderRadius: "8px", overflow: "hidden" }}>
        <MapContainer
          center={[35.68, 139.76]}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {startPoint && <Marker position={[startPoint.lat, startPoint.lng]} />}
          {endPoint && <Marker position={[endPoint.lat, endPoint.lng]} />}
          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="var(--primary-color)" weight={5} opacity={0.7} />
          )}
          {mapBounds && <FitBounds bounds={mapBounds} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default DirectionsComponent;