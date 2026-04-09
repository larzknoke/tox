"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, FileText, Euro } from "lucide-react";
import { updateOrderStatusAction } from "../actions/update-order-status";
import { deleteOrderAction } from "../actions/delete-order";
import { generateInvoicePDFAction } from "../actions/generate-invoice-pdf";

const statuses = ["PENDING", "VALIDATED", "PROCESSING", "SHIPPED"];

const statusVariant = {
  PENDING: "secondary",
  VALIDATED: "default",
  PROCESSING: "default",
  SHIPPED: "outline",
};

export default function OrderTable({ orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [isPending, startTransition] = useTransition();

  const filtered = orders.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  function handleStatusChange(orderId, newStatus) {
    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, newStatus);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
        toast.success("Status updated");
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  function handleDelete() {
    if (!deleteOrder) return;
    startTransition(async () => {
      try {
        await deleteOrderAction(deleteOrder.id);
        setOrders((prev) => prev.filter((o) => o.id !== deleteOrder.id));
        toast.success("Order deleted");
      } catch {
        toast.error("Failed to delete order");
      } finally {
        setDeleteOrder(null);
      }
    });
  }

  const [generatingPDFId, setGeneratingPDFId] = useState(null);

  const totalPrice = (order) =>
    order.items.reduce((sum, i) => sum + i.totalPrice, 0);

  const totalTickets = (order) =>
    order.items.reduce(
      (sum, i) => sum + i.quantityPerPack * i.numberOfPacks,
      0,
    );

  async function handleDownloadInvoicePDF(order) {
    setGeneratingPDFId(order.id);
    try {
      const result = await generateInvoicePDFAction(order.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      const blob = new Blob([new Uint8Array(result.pdfBuffer)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error("Failed to generate PDF: " + error.message);
    } finally {
      setGeneratingPDFId(null);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        #{order.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{order.user?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.email ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {order.items.reduce((s, i) => s + i.numberOfPacks, 0)} packs
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {totalTickets(order).toLocaleString()} tickets
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    €{totalPrice(order).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {new Date(order.createdAt).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDetailOrder(order)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View details</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadInvoicePDF(order)}
                            disabled={generatingPDFId === order.id}
                          >
                            <Euro className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download Invoice PDF</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteOrder(order)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete order</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteOrder}
        onOpenChange={(open) => !open && setDeleteOrder(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order{" "}
              <strong>#{deleteOrder?.id}</strong> ({deleteOrder?.name}
              )? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order detail dialog */}
      <Dialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailOrder?.name}{" "}
              <Badge
                variant={statusVariant[detailOrder?.status] ?? "secondary"}
                className="ml-2"
              >
                {detailOrder?.status}
              </Badge>
            </DialogTitle>
            <p className="text-xs text-muted-foreground font-mono">
              #{detailOrder?.id}
            </p>
          </DialogHeader>

          {detailOrder && (
            <div className="flex flex-col gap-4">
              {/* Customer */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Customer
                </p>
                <p className="text-sm">
                  {detailOrder.user?.name ?? "—"} (
                  {detailOrder.user?.email ?? "—"})
                </p>
              </div>

              <Separator />

              {/* Items */}
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/40">
                  <span>Product</span>
                  <span className="text-right">Qty</span>
                  <span className="text-right">Unit Price</span>
                  <span className="text-right">Total</span>
                </div>
                {detailOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2.5 text-sm border-b last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.designation}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.reference} &middot; {item.quantityPerPack}{" "}
                        tickets/pack &middot;{" "}
                        {(
                          item.quantityPerPack * item.numberOfPacks
                        ).toLocaleString()}{" "}
                        tickets total
                      </p>
                    </div>
                    <span className="text-right tabular-nums">
                      {item.numberOfPacks}
                    </span>
                    <span className="text-right tabular-nums">
                      €{item.pricePerPack.toFixed(2)}
                    </span>
                    <span className="text-right font-semibold tabular-nums">
                      €{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_3rem_6rem_6rem] gap-x-4 px-4 py-2.5 text-sm font-semibold bg-muted/40">
                  <span>Total (excl. VAT)</span>
                  <span />
                  <span />
                  <span className="text-right tabular-nums">
                    €{totalPrice(detailOrder).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Billing Address
                  </p>
                  {detailOrder.billingAddress ? (
                    <div className="text-sm space-y-0.5 text-muted-foreground">
                      <p className="text-foreground font-medium">
                        {detailOrder.billingAddress.firstName}{" "}
                        {detailOrder.billingAddress.lastName}
                      </p>
                      {detailOrder.billingAddress.company && (
                        <p>{detailOrder.billingAddress.company}</p>
                      )}
                      <p>{detailOrder.billingAddress.address1}</p>
                      {detailOrder.billingAddress.address2 && (
                        <p>{detailOrder.billingAddress.address2}</p>
                      )}
                      <p>
                        {detailOrder.billingAddress.postalCode}{" "}
                        {detailOrder.billingAddress.city}
                      </p>
                      <p>{detailOrder.billingAddress.country}</p>
                      <p>{detailOrder.billingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Delivery Address
                  </p>
                  {detailOrder.deliveryAddress ? (
                    <div className="text-sm space-y-0.5 text-muted-foreground">
                      <p className="text-foreground font-medium">
                        {detailOrder.deliveryAddress.firstName}{" "}
                        {detailOrder.deliveryAddress.lastName}
                      </p>
                      {detailOrder.deliveryAddress.company && (
                        <p>{detailOrder.deliveryAddress.company}</p>
                      )}
                      <p>{detailOrder.deliveryAddress.address1}</p>
                      {detailOrder.deliveryAddress.address2 && (
                        <p>{detailOrder.deliveryAddress.address2}</p>
                      )}
                      <p>
                        {detailOrder.deliveryAddress.postalCode}{" "}
                        {detailOrder.deliveryAddress.city}
                      </p>
                      <p>{detailOrder.deliveryAddress.country}</p>
                      <p>{detailOrder.deliveryAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </div>

              {/* Invoice */}
              {detailOrder.invoice && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Invoice
                    </p>
                    <p className="text-sm">
                      #{detailOrder.invoice.invoiceNumber} &middot;{" "}
                      {new Date(
                        detailOrder.invoice.invoiceDate,
                      ).toLocaleDateString("de-DE")}{" "}
                      &middot; €{detailOrder.invoice.totalAmount.toFixed(2)}{" "}
                      {detailOrder.invoice.currency}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
