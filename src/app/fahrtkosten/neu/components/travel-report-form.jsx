"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VehicleInput } from "./vehicle-input";
import { createTravelReport } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const TRAVEL_KM_RATE =
  parseFloat(process.env.NEXT_PUBLIC_TRAVEL_KM_RATE) || 0.3;

const travelReportSchema = z.object({
  travelDate: z.string().min(1, { message: "Fahrtdatum ist erforderlich" }),
  destination: z.string().min(1, { message: "Ziel ist erforderlich" }),
  reason: z.string().optional(),
  teamId: z.string().min(1, { message: "Mannschaft ist erforderlich" }),
});

export default function TravelReportForm({ teams, currentUser }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(travelReportSchema),
    defaultValues: {
      travelDate: "",
      destination: "",
      reason: "",
      teamId: "",
    },
  });

  const calculateTotalDistance = () => {
    return vehicles.reduce((sum, v) => sum + (parseFloat(v.distance) || 0), 0);
  };

  const calculateTotalCost = () => {
    return vehicles.reduce((sum, v) => {
      const distanceKm = parseFloat(v.distance) || 0;
      const noCharge = Boolean(v.noCharge);
      const cost = noCharge ? 0 : distanceKm * TRAVEL_KM_RATE;
      return sum + cost;
    }, 0);
  };

  async function onSubmit(values) {
    if (vehicles.length === 0) {
      toast.error("Bitte fügen Sie mindestens ein Fahrzeug hinzu");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createTravelReport({
        ...values,
        distance: calculateTotalDistance(),
        totalCost: calculateTotalCost(),
        vehicles: vehicles,
      });

      if (result.success) {
        toast.success(result.message);
        router.push("/fahrtkosten");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ein Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onReset() {
    form.reset();
    setVehicles([]);
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full  md:w-5/12">
        <Card>
          <CardHeader>
            <CardTitle>Fahrtkosten-Abrechnung</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                onReset={onReset}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="travelDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fahrtdatum</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ziel</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Hameln" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grund (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Spiel, Turnier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mannschaft</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className={"w-full"}>
                            <SelectValue placeholder="Mannschaft auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem
                                key={team.id}
                                value={team.id.toString()}
                              >
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Gesamtdistanz</p>
                  <p className="text-2xl font-bold">
                    {calculateTotalDistance().toFixed(1)} km
                  </p>
                </div>

                <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Gesamtkosten</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(calculateTotalCost())}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="success"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Wird gespeichert..." : "Speichern"}
                  </Button>
                  <Button
                    type="reset"
                    variant="outline"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Zurücksetzen
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="w-full md:w-7/12">
        <VehicleInput vehicles={vehicles} onVehiclesChange={setVehicles} />
      </div>
    </div>
  );
}
