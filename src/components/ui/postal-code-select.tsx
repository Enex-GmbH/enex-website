"use client";

import * as React from "react";
import { CheckIcon, ChevronDownIcon, Search, MapPin } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { postalCodes, searchPostalCodes, type PostalCode } from "@/lib/data/postal-codes";

interface PostalCodeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PostalCodeSelect({
  value,
  onValueChange,
  placeholder = "PLZ auswählen",
  className,
  disabled = false,
}: PostalCodeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredCodes, setFilteredCodes] = React.useState(postalCodes);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Filter postal codes based on search query
  React.useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCodes(postalCodes);
    } else {
      setFilteredCodes(searchPostalCodes(searchQuery));
    }
  }, [searchQuery]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  const selectedPostalCode = postalCodes.find((pc) => pc.code === value);

  // Group filtered codes by city
  const groupedCodes = React.useMemo(() => {
    const groups: Record<string, PostalCode[]> = {};
    filteredCodes.forEach((pc) => {
      if (!groups[pc.city]) {
        groups[pc.city] = [];
      }
      groups[pc.city].push(pc);
    });
    return groups;
  }, [filteredCodes]);

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-12 !bg-white hover:!bg-white",
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="h-4 w-4 text-enex-primary shrink-0" />
          <SelectPrimitive.Value placeholder={placeholder}>
            {selectedPostalCode
              ? `${selectedPostalCode.code} - ${selectedPostalCode.city}`
              : placeholder}
          </SelectPrimitive.Value>
        </div>
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="!bg-white text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-50 max-h-[300px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border shadow-md"
          position="popper"
          align="start"
        >
          {/* Search Input */}
          <div className="p-2 border-b sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="PLZ oder Stadt suchen..."
                className="w-full pl-8 pr-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-enex-primary focus:border-transparent"
                onKeyDown={(e) => {
                  // Prevent closing dropdown when typing
                  if (e.key === "Escape") {
                    setOpen(false);
                  }
                  e.stopPropagation();
                }}
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <SelectPrimitive.Viewport className="p-1 max-h-[250px] overflow-y-auto">
            {filteredCodes.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-gray-500">
                Keine Ergebnisse gefunden
              </div>
            ) : (
              Object.entries(groupedCodes).map(([city, codes]) => (
                <div key={city} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {city}
                  </div>
                  {codes.map((pc) => (
                    <SelectPrimitive.Item
                      key={pc.code}
                      value={pc.code}
                      className="!bg-white focus:!bg-gray-100 relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      onSelect={() => {
                        setOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <span className="absolute right-2 flex size-3.5 items-center justify-center">
                        <SelectPrimitive.ItemIndicator>
                          <CheckIcon className="size-4" />
                        </SelectPrimitive.ItemIndicator>
                      </span>
                      <MapPin className="h-3 w-3 text-enex-primary shrink-0" />
                      <SelectPrimitive.ItemText>
                        <span className="font-medium">{pc.code}</span>
                        <span className="text-gray-500 ml-2">- {pc.city}</span>
                      </SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  ))}
                </div>
              ))
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
