"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";

export default function AddToCartForm({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { t } = useLocale();

  function handleAdd() {
    addToCart(product, quantity);
    toast.success(
      t("shop.detail.addedToCart", {
        quantity,
        reference: product.reference,
        packsLabel:
          quantity === 1
            ? t("shop.detail.packOne")
            : t("shop.detail.packOther"),
      }),
    );
  }

  return (
    <ButtonGroup>
      <Input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) =>
          setQuantity(Math.max(1, parseInt(e.target.value) || 1))
        }
        className="w-20 text-center"
      />
      <Button
        variant="outline"
        onClick={handleAdd}
        aria-label={t("shop.detail.addToCart")}
      >
        <ShoppingCart />
        {t("shop.detail.addToCart")}
      </Button>
    </ButtonGroup>
  );
}
