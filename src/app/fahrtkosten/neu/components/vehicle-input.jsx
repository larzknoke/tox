"use client";

import { useState } from "react";

const TRAVEL_KM_RATE =
  parseFloat(process.env.NEXT_PUBLIC_TRAVEL_KM_RATE) || 0.3;

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusIcon, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DISTANCE_PRESETS = [
  { label: "Geismar", distance: 134 },
  { label: "Worbis", distance: 230 },
  { label: "Uslar", distance: 56 },
  { label: "Northeim", distance: 110 },
  { label: "Rhumetal/Katlenburg", distance: 130 },
  { label: "Duderstadt", distance: 176 },
  { label: "OHA/ Hattorf", distance: 156 },
  { label: "Plesse/Bovenden", distance: 120 },
  { label: "Landolfshausen", distance: 156 },
  { label: "JSG Münden/HannMünden", distance: 132 },
  { label: "Langelsheim", distance: 190 },
  { label: "Bad Harzburg", distance: 200 },
  { label: "Rosdorf", distance: 140 },
];

export function VehicleInput({ vehicles, onVehiclesChange }) {
  const [selectedDistancePreset, setSelectedDistancePreset] = useState("");

  const addVehicle = () => {
    // Use selected preset, otherwise copy from first vehicle, then fall back to empty.
    const defaultDistance =
      selectedDistancePreset || vehicles[0]?.distance || "";

    onVehiclesChange([
      ...vehicles,
      {
        driver: "",
        distance: defaultDistance,
        noCharge: false,
      },
    ]);
  };

  const removeVehicle = (index) => {
    onVehiclesChange(vehicles.filter((_, i) => i !== index));
  };

  const updateVehicle = (index, field, value) => {
    const updated = [...vehicles];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onVehiclesChange(updated);
  };

  const calculateVehicleCost = (distance, noCharge) => {
    if (noCharge) return 0;
    return (parseFloat(distance) || 0) * TRAVEL_KM_RATE;
  };

  const calculateTotalDistance = () => {
    return vehicles.reduce((sum, v) => sum + (parseFloat(v.distance) || 0), 0);
  };

  const calculateTotalCost = () => {
    return vehicles.reduce(
      (sum, v) => sum + calculateVehicleCost(v.distance, v.noCharge),
      0,
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Fahrzeuge</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Strecken-Vorlage</label>
            <Select
              value={selectedDistancePreset}
              onValueChange={setSelectedDistancePreset}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ort auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                {DISTANCE_PRESETS.map((preset) => (
                  <SelectItem
                    key={`${preset.label}-${preset.distance}`}
                    value={String(preset.distance)}
                  >
                    {preset.label} {preset.distance} km
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Keine Fahrzeuge hinzugefügt
            </p>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium">Fahrer</label>
                        <Input
                          placeholder="Name des Fahrers"
                          value={vehicle.driver}
                          onChange={(e) =>
                            updateVehicle(index, "driver", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium">
                          Distanz (km)
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.1"
                          value={vehicle.distance}
                          onChange={(e) =>
                            updateVehicle(index, "distance", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium">
                          Kosten @ €{TRAVEL_KM_RATE}/km
                        </label>
                        <div className="mt-1 px-3 py-2 bg-gray-100 rounded border border-gray-200">
                          <p className="text-sm font-semibold">
                            {formatCurrency(
                              calculateVehicleCost(
                                vehicle.distance,
                                vehicle.noCharge,
                              ),
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-12 md:col-span-4 flex gap-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`noCharge-${index}`}
                            checked={vehicle.noCharge}
                            onChange={(e) =>
                              updateVehicle(index, "noCharge", e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                          />
                          <label
                            htmlFor={`noCharge-${index}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            ohne Berechnung
                          </label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>z.B. TV-Bulli verwendet</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-4 flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVehicle(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addVehicle}
            className="w-full"
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Fahrzeug hinzufügen
          </Button>

          {/* {vehicles.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamtdistanz</p>
                  <p className="text-lg font-semibold">
                    {calculateTotalDistance().toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gesamtkosten</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(calculateTotalCost())}
                  </p>
                </div>
              </div>
            </div>
          )} */}
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>
              Bitte die Gesamtstrecke eingeben (Hin- und Rückweg bereits
              zusammenrechnen).
            </AlertTitle>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
