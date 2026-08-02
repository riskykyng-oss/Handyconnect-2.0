import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCenter = { lat: -17.8252, lng: 31.0335 }; // Harare

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const markerColor = (m) => {
  if (m.color) return m.color;
  return (m.type || 'handyman') === 'job' ? '#f97316' : '#0ea5e9';
};

const buildIcon = (marker) => {
  const color = markerColor(marker);
  const label = marker.label || '•';
  const html = `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="min-width:30px;height:30px;padding:0 4px;border-radius:9999px;background:${color};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.4);">${label}</div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${color};margin-top:-2px;"></div>
    </div>`;
  return L.divIcon({ html, className: 'hc-marker-wrap', iconSize: [30, 38], iconAnchor: [15, 38], tooltipAnchor: [0, -36] });
};

function MapController({ center, zoom }) {
  const map = useMap();
  const lat = center?.lat;
  const lng = center?.lng;
  useEffect(() => {
    if (typeof lat === 'number' && typeof lng === 'number') {
      map.setView([lat, lng], zoom ?? map.getZoom(), { animate: true });
    }
  }, [lat, lng, zoom, map]);
  return null;
}

function ClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export default function MapView({
  center,
  markers = [],
  zoom = 13,
  className = '',
  onLoad,
  onClick,
}) {
  const mapCenter = center?.lat != null ? center : defaultCenter;

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={zoom}
      className={className}
      style={{ width: '100%', height: '100%' }}
      zoomControl
      attributionControl
      whenReady={(e) => onLoad?.(e.target)}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} subdomains="abcd" maxZoom={20} />
      <MapController center={center} zoom={zoom} />
      {onClick && <ClickHandler onClick={onClick} />}
      {markers.map((m, i) => (
        <Marker key={m.id || i} position={[m.position.lat, m.position.lng]} icon={buildIcon(m)} title={m.title}>
          {m.title && (
            <Tooltip direction="top" offset={[0, -36]} opacity={1}>
              {m.title}
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
