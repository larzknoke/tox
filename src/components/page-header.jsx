import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function PageHeader({ title }) {
  return (
    <div className="flex w-full border-b pb-3">
      <SidebarTrigger />
      <Separator
        orientation="vertical"
        className="mx-3 data-[orientation=vertical]:h-6 mt-0.5"
      />
      <h1>{title}</h1>
    </div>
  );
}
