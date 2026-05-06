"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useEffect } from "react";

/** Lefkoşa — varsayılan harita odak noktası */
const MAP_CENTER: [number, number] = [35.1856, 33.3823];

const MAP_ZOOM = 13;

/**
 * Leaflet'in varsayılan işaretçi görselleri bundler ile kırılıyor; CDN ile sabitliyoruz.
 */
function useFixLeafletDefaultIcons(): void {
  useEffect(() => {
    // @ts-expect-error — Leaflet default ikonunun paket içi path'leri Next.js ile bozuluyor.
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);
}

export default function MapWidget() {
  useFixLeafletDefaultIcons();

  return (
    <div
      className="relative z-0 h-[400px] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600 [&_.leaflet-container]:isolate [&_.leaflet-pane]:rounded-xl [&_.leaflet-control-attribution]:rounded-bl-lg [&_.leaflet-control-attribution]:border-0 [&_.leaflet-control-attribution]:bg-black/55 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-slate-400"
      role="presentation"
      aria-label="Konum haritası"
    >
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        scrollWheelZoom
        className="h-full w-full rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <Marker position={MAP_CENTER} />
      </MapContainer>
    </div>
  );
}
