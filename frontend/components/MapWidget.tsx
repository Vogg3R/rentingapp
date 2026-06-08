"use client";

import {
  DEFAULT_MAP_ZOOM,
  GOOGLE_MAPS_DARK_STYLES,
  GOOGLE_MAPS_LIBRARIES,
  LEFKOSA_CENTER,
  SELECTED_LOCATION_ZOOM,
} from "@/constants/google-maps";
import type { MapCoordinates } from "@/types/map";
import {
  Autocomplete,
  GoogleMap,
  Marker,
  useLoadScript,
} from "@react-google-maps/api";
import { Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface MapWidgetProps {
  address: string;
  onAddressChange: (address: string) => void;
  position: MapCoordinates;
  onPositionChange: (position: MapCoordinates) => void;
  searchInputId?: string;
  searchLabel?: string;
}

const MAP_CONTAINER_CLASS =
  "relative z-0 h-[400px] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-[var(--color-app-bg)] py-3 pl-10 pr-4 text-sm text-[var(--color-text)] shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600";

/** Google Maps tabanlı konum seçici — tıklama, sürükleme ve adres arama */
export default function MapWidget({
  address,
  onAddressChange,
  position,
  onPositionChange,
  searchInputId = "map-address-search",
  searchLabel = "Adres arama",
}: MapWidgetProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      styles: isDark ? GOOGLE_MAPS_DARK_STYLES : undefined,
    }),
    [isDark]
  );

  const focusMapOnPosition = useCallback((coords: MapCoordinates, zoom?: number) => {
    mapRef.current?.panTo(coords);
    if (zoom != null) {
      mapRef.current?.setZoom(zoom);
    }
  }, []);

  const reverseGeocode = useCallback(
    (coords: MapCoordinates) => {
      if (!window.google?.maps?.Geocoder) return;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === "OK" && results?.[0]?.formatted_address) {
          onAddressChange(results[0].formatted_address);
        }
      });
    },
    [onAddressChange]
  );

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const lat = event.latLng?.lat();
      const lng = event.latLng?.lng();
      if (lat == null || lng == null) return;
      const coords = { lat, lng };
      onPositionChange(coords);
      reverseGeocode(coords);
    },
    [onPositionChange, reverseGeocode]
  );

  const handleMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const lat = event.latLng?.lat();
      const lng = event.latLng?.lng();
      if (lat == null || lng == null) return;
      const coords = { lat, lng };
      onPositionChange(coords);
      reverseGeocode(coords);
    },
    [onPositionChange, reverseGeocode]
  );

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return;

    const coords = { lat: location.lat(), lng: location.lng() };
    onPositionChange(coords);
    if (place.formatted_address) {
      onAddressChange(place.formatted_address);
    }
    focusMapOnPosition(coords, SELECTED_LOCATION_ZOOM);
  }, [focusMapOnPosition, onAddressChange, onPositionChange]);

  if (!apiKey) {
    return (
      <div className="space-y-3">
        <AddressSearchField
          searchInputId={searchInputId}
          searchLabel={searchLabel}
          address={address}
          onAddressChange={onAddressChange}
          disabled
        />
        <div
          className={`${MAP_CONTAINER_CLASS} flex items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-800/80 dark:text-slate-400`}
        >
          Google Maps API anahtarı tanımlı değil.
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-3">
        <AddressSearchField
          searchInputId={searchInputId}
          searchLabel={searchLabel}
          address={address}
          onAddressChange={onAddressChange}
          disabled
        />
        <div
          className={`${MAP_CONTAINER_CLASS} flex items-center justify-center bg-red-50 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200`}
        >
          Harita yüklenemedi. API anahtarını ve etkin servisleri kontrol edin.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-3">
        <AddressSearchField
          searchInputId={searchInputId}
          searchLabel={searchLabel}
          address={address}
          onAddressChange={onAddressChange}
          disabled
        />
        <div
          className={`${MAP_CONTAINER_CLASS} flex items-center justify-center bg-slate-100 text-xs text-slate-500 dark:bg-slate-800/80 dark:text-slate-400`}
          aria-hidden
        >
          Harita yükleniyor…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor={searchInputId}
        className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
      >
        {searchLabel}
      </label>
      <Autocomplete
        onLoad={(autocomplete) => {
          autocompleteRef.current = autocomplete;
        }}
        onPlaceChanged={handlePlaceChanged}
        options={{
          componentRestrictions: { country: ["cy", "tr"] },
          fields: ["formatted_address", "geometry", "name"],
        }}
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id={searchInputId}
            type="text"
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            placeholder="Lefkoşa, Gönyeli, Atatürk Cad. …"
            className={INPUT_CLASS}
            autoComplete="off"
          />
        </div>
      </Autocomplete>

      <div className={MAP_CONTAINER_CLASS} role="presentation" aria-label="Konum haritası">
        <GoogleMap
          mapContainerClassName="h-full w-full rounded-xl"
          center={position}
          zoom={DEFAULT_MAP_ZOOM}
          options={mapOptions}
          onClick={handleMapClick}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          <Marker
            position={position}
            draggable
            onDragEnd={handleMarkerDragEnd}
            animation={google.maps.Animation.DROP}
          />
        </GoogleMap>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Haritaya tıklayarak veya pini sürükleyerek konum seçebilirsiniz.
      </p>
    </div>
  );
}

interface AddressSearchFieldProps {
  searchInputId: string;
  searchLabel: string;
  address: string;
  onAddressChange: (address: string) => void;
  disabled?: boolean;
}

/** Harita yüklenmeden önce aynı adres alanını gösterir */
function AddressSearchField({
  searchInputId,
  searchLabel,
  address,
  onAddressChange,
  disabled = false,
}: AddressSearchFieldProps) {
  return (
    <div>
      <label
        htmlFor={searchInputId}
        className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
      >
        {searchLabel}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          id={searchInputId}
          type="text"
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          placeholder="Lefkoşa, Gönyeli, Atatürk Cad. …"
          className={INPUT_CLASS}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
