import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      <p className="text-muted-foreground">Your cart is empty.</p>
      <Button asChild variant="outline">
        <Link href="/shop">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </Button>
    </div>
  );
}
