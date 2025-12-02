"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PlaceResult {
  address: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

interface PlacesAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

// Google Maps types
interface AutocompleteInstance {
  addListener: (event: string, callback: () => void) => void;
  getPlace: () => {
    address_components?: Array<{
      types: string[];
      long_name: string;
    }>;
    formatted_address?: string;
  };
}

interface GoogleMapsWindow extends Window {
  google?: {
    maps: {
      places: {
        Autocomplete: new (
          input: HTMLInputElement,
          options?: {
            types?: string[];
            componentRestrictions?: { country: string };
            fields?: string[];
          }
        ) => AutocompleteInstance;
      };
    };
  };
}

declare const window: GoogleMapsWindow;

export function PlacesAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<AutocompleteInstance | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Google Places API script
  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener("load", () => {
        setIsScriptLoaded(true);
      });
      return;
    }

    // Load the script
    const script = document.createElement("script");
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsScriptLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Places API");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      // Note: We don't remove it if other components might use it
    };
  }, []);

  // Initialize autocomplete when script is loaded and input is ready
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || isInitialized || !window.google)
      return;

    try {
      // Create autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "de" }, // Restrict to Germany
          fields: [
            "formatted_address",
            "address_components",
            "geometry",
            "place_id",
          ],
        }
      );

      autocompleteRef.current = autocomplete;

      // Handle place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.address_components || !place.formatted_address) {
          return;
        }

        // Extract address components
        let postalCode = "";
        let city = "";
        let country = "";

        place.address_components.forEach(
          (component: { types: string[]; long_name: string }) => {
            const types = component.types;

            if (types.includes("postal_code")) {
              postalCode = component.long_name;
            }
            if (
              types.includes("locality") ||
              types.includes("administrative_area_level_1")
            ) {
              city = component.long_name;
            }
            if (types.includes("country")) {
              country = component.long_name;
            }
          }
        );

        // Call onChange with the formatted address
        onChange(place.formatted_address);

        // Call onPlaceSelect with structured data
        onPlaceSelect({
          address: place.formatted_address,
          postalCode: postalCode || undefined,
          city: city || undefined,
          country: country || undefined,
        });
      });

      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
    }
  }, [isScriptLoaded, onChange, onPlaceSelect, isInitialized]);

  // Sync external value changes to input (when value changes externally)
  const previousValueRef = useRef(value);
  useEffect(() => {
    if (inputRef.current && value !== previousValueRef.current) {
      inputRef.current.value = value;
      previousValueRef.current = value;
    }
  }, [value]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className={cn(className)}
        autoComplete="off"
      />
    </div>
  );
}
