import { PlatformLogo } from "@/components/PlatformLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNewOrder } from "@/hooks/useNewOrder";
import type { Service, ServiceCategory } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  RefreshCw,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Step = 1 | 2;

interface OrderFormValues {
  link: string;
  quantity: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// CATEGORY_ICONS replaced by <PlatformLogo> component

function formatPrice(n: number) {
  return `₹${n.toFixed(2)}`;
}

// ─── Step 1: Service Selector ─────────────────────────────────────────────────
function ServiceSelector({
  servicesByCategory,
  categoryLabels,
  selectedId,
  onSelect,
}: {
  servicesByCategory: Map<ServiceCategory, Service[]>;
  categoryLabels: Record<ServiceCategory, string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expandedCat, setExpandedCat] = useState<ServiceCategory | null>(null);
  const [filter, setFilter] = useState<"all" | "cheapest" | "fastest" | "best">(
    "all",
  );

  const getFiltered = (svcs: Service[]) => {
    if (filter === "cheapest")
      return [...svcs].sort((a, b) => a.pricePerThousand - b.pricePerThousand);
    if (filter === "fastest")
      return [...svcs].sort((a, b) =>
        a.speed === "fast" ? -1 : b.speed === "fast" ? 1 : 0,
      );
    if (filter === "best") return [...svcs].sort((a, b) => b.rating - a.rating);
    return svcs;
  };

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "cheapest", "fastest", "best"] as const).map((f) => (
          <button
            key={f}
            type="button"
            data-ocid={`new_order.filter.${f}`}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth border ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted border-border text-muted-foreground hover:border-primary/60 hover:text-foreground"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "cheapest"
                ? "Cheapest"
                : f === "fastest"
                  ? "Fastest"
                  : "Best Quality"}
          </button>
        ))}
      </div>

      {/* Category accordions */}
      <div className="space-y-2">
        {Array.from(servicesByCategory.entries()).map(([cat, svcs]) => (
          <div
            key={cat}
            className="rounded-xl border border-border overflow-hidden"
          >
            <button
              type="button"
              data-ocid={`new_order.category.${cat}`}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary transition-smooth text-left"
              onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
            >
              <span className="flex items-center gap-2 font-medium">
                <PlatformLogo platform={cat} size={18} />
                {categoryLabels[cat]}
                <Badge variant="secondary" className="text-xs">
                  {svcs.length}
                </Badge>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  expandedCat === cat ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedCat === cat && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-2 space-y-1.5 bg-background">
                    {getFiltered(svcs).map((svc) => (
                      <ServiceCard
                        key={svc.id}
                        service={svc}
                        selected={selectedId === svc.id}
                        onSelect={() => onSelect(svc.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  const speedColors = {
    fast: "bg-accent/20 text-accent",
    medium: "bg-yellow-500/20 text-yellow-400",
    slow: "bg-muted text-muted-foreground",
  };
  const speedLabels = { fast: "Fast", medium: "Medium", slow: "Slow" };

  return (
    <button
      type="button"
      data-ocid={`new_order.service.${service.id}`}
      onClick={onSelect}
      className={`w-full text-left rounded-lg px-4 py-3 transition-smooth border ${
        selected
          ? "border-primary bg-primary/10 shadow-[0_0_12px_oklch(var(--primary)/0.2)]"
          : "border-transparent hover:border-border hover:bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm leading-snug truncate">
            {service.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {service.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-semibold text-primary">
            {formatPrice(service.pricePerThousand)}/1K
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${speedColors[service.speed]}`}
          >
            {speedLabels[service.speed]}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {service.deliveryTime}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {service.rating}%
        </span>
        {service.refill && (
          <span className="flex items-center gap-1 text-xs text-accent">
            <RefreshCw className="h-3 w-3" />
            Refill
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          Min {service.minOrder.toLocaleString()} / Max{" "}
          {service.maxOrder.toLocaleString()}
        </span>
      </div>
    </button>
  );
}

// ─── Reliability Bar ──────────────────────────────────────────────────────────
function ReliabilityBar({ rating }: { rating: number }) {
  const color =
    rating >= 97
      ? "bg-accent"
      : rating >= 90
        ? "bg-yellow-400"
        : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Service Reliability</span>
        <span className="font-medium">{rating}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${rating}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function NewOrderPage() {
  const navigate = useNavigate();
  const {
    servicesByCategory,
    categoryLabels,
    getService,
    calcPrice,
    getSpeedColor,
    getSpeedLabel,
    isPlacingOrder,
    placeOrder,
  } = useNewOrder();

  const [step, setStep] = useState<Step>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedService = useMemo(
    () => (selectedServiceId ? getService(selectedServiceId) : null),
    [selectedServiceId, getService],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    defaultValues: { link: "", quantity: selectedService?.minOrder ?? 100 },
  });

  const quantity = watch("quantity");
  const link = watch("link");
  const price = calcPrice(selectedService, Number(quantity));

  // Reset quantity when service changes
  useEffect(() => {
    if (selectedService) {
      setValue("quantity", selectedService.minOrder);
    }
  }, [selectedService, setValue]);

  // Read pre-selected service from URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preId = params.get("serviceId");
    if (preId) {
      setSelectedServiceId(preId);
      setStep(2);
    }
  }, []);

  function handleServiceSelect(id: string) {
    setSelectedServiceId(id);
  }

  function handleContinue() {
    if (!selectedServiceId) return;
    setStep(2);
  }

  async function onConfirmOrder() {
    if (!selectedService || !link) return;
    setConfirmOpen(false);
    const ok = await placeOrder(selectedService.id, link, Number(quantity));
    if (ok) {
      toast.success("Order placed successfully!", {
        description: `${selectedService.name} — ${Number(quantity).toLocaleString()} units`,
        duration: 5000,
      });
      navigate({ to: "/orders" });
    } else {
      toast.error("Failed to place order. Please try again.");
    }
  }

  const isValidUrl = (val: string) => {
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div
      data-ocid="new_order.page"
      className="max-w-2xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-display font-bold">New Order</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select a service, enter details, and place your order instantly.
        </p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([1, 2] as const).map((s) => (
          <React.Fragment key={s}>
            <button
              type="button"
              data-ocid={`new_order.step.${s}`}
              onClick={() => s < step && setStep(s)}
              className={`flex items-center gap-2 text-sm font-medium transition-smooth ${
                step === s
                  ? "text-foreground"
                  : s < step
                    ? "text-primary cursor-pointer hover:underline"
                    : "text-muted-foreground cursor-default"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-smooth ${
                  step === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : s < step
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </span>
              {s === 1 ? "Select Service" : "Order Details"}
            </button>
            {s < 2 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <ServiceSelector
              servicesByCategory={servicesByCategory}
              categoryLabels={categoryLabels}
              selectedId={selectedServiceId}
              onSelect={handleServiceSelect}
            />

            {/* Selected service preview */}
            <AnimatePresence>
              {selectedService && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-snug">
                        {selectedService.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedService.description}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${selectedService.speed === "fast" ? "bg-accent/20 text-accent" : selectedService.speed === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-muted text-muted-foreground"}`}
                    >
                      <Zap className="h-3 w-3" />
                      {getSpeedLabel(selectedService.speed)}
                    </span>
                  </div>
                  <ReliabilityBar rating={selectedService.rating} />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-background rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">
                        Price / 1K
                      </p>
                      <p className="font-semibold text-sm text-primary">
                        {formatPrice(selectedService.pricePerThousand)}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="font-semibold text-sm">
                        {selectedService.deliveryTime}
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Refill</p>
                      <p
                        className={`font-semibold text-sm ${selectedService.refill ? "text-accent" : "text-muted-foreground"}`}
                      >
                        {selectedService.refill ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="button"
              data-ocid="new_order.continue_button"
              className="w-full h-12 text-base font-semibold glow-primary"
              disabled={!selectedServiceId}
              onClick={handleContinue}
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && selectedService && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <form
              ref={formRef}
              data-ocid="new_order.form"
              onSubmit={handleSubmit(() => setConfirmOpen(true))}
              className="space-y-5"
            >
              {/* Selected service summary */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Selected Service
                    </p>
                    <p className="font-semibold text-sm leading-snug mt-0.5 truncate">
                      {selectedService.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid="new_order.change_service_button"
                    className="text-xs text-primary hover:underline shrink-0"
                    onClick={() => setStep(1)}
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span
                    className={`text-xs font-semibold flex items-center gap-1 ${getSpeedColor(selectedService.speed)}`}
                  >
                    <Zap className="h-3 w-3" />
                    {getSpeedLabel(selectedService.speed)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {selectedService.deliveryTime}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {selectedService.rating}% reliability
                  </span>
                </div>
                <div className="mt-3">
                  <ReliabilityBar rating={selectedService.rating} />
                </div>
              </div>

              {/* Link input */}
              <div className="space-y-1.5">
                <Label htmlFor="link" className="text-sm font-medium">
                  Target URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="link"
                  data-ocid="new_order.link_input"
                  placeholder="https://instagram.com/yourprofile"
                  {...register("link", {
                    required: "Link is required",
                    validate: (v) =>
                      isValidUrl(v) || "Please enter a valid URL",
                  })}
                  className={`h-11 ${errors.link ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.link && (
                  <p
                    data-ocid="new_order.link_field_error"
                    className="flex items-center gap-1 text-xs text-destructive"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.link.message}
                  </p>
                )}
              </div>

              {/* Quantity slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Quantity <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Min {selectedService.minOrder.toLocaleString()} – Max{" "}
                    {selectedService.maxOrder.toLocaleString()}
                  </span>
                </div>
                <Input
                  id="quantity"
                  type="number"
                  data-ocid="new_order.quantity_input"
                  min={selectedService.minOrder}
                  max={selectedService.maxOrder}
                  step={selectedService.minOrder >= 1000 ? 100 : 10}
                  {...register("quantity", {
                    required: "Quantity is required",
                    valueAsNumber: true,
                    min: {
                      value: selectedService.minOrder,
                      message: `Minimum is ${selectedService.minOrder.toLocaleString()}`,
                    },
                    max: {
                      value: selectedService.maxOrder,
                      message: `Maximum is ${selectedService.maxOrder.toLocaleString()}`,
                    },
                  })}
                  className={`h-11 ${errors.quantity ? "border-destructive" : ""}`}
                />
                <input
                  type="range"
                  min={selectedService.minOrder}
                  max={Math.min(
                    selectedService.maxOrder,
                    selectedService.minOrder * 100,
                  )}
                  step={selectedService.minOrder >= 1000 ? 100 : 10}
                  value={Number(quantity)}
                  onChange={(e) =>
                    setValue("quantity", Number(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  className="w-full h-1.5 accent-primary rounded-full cursor-pointer"
                />
                {errors.quantity && (
                  <p
                    data-ocid="new_order.quantity_field_error"
                    className="flex items-center gap-1 text-xs text-destructive"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Live price panel */}
              <motion.div
                key={price}
                initial={{ scale: 0.98, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="rounded-xl border border-primary/30 bg-primary/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Estimated Total
                  </span>
                  <span className="text-2xl font-display font-bold text-primary">
                    {formatPrice(price)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(selectedService.pricePerThousand)}/1K ×{" "}
                    {Number(quantity).toLocaleString()} units
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Est. {selectedService.deliveryTime}
                  </span>
                </div>
              </motion.div>

              {/* Place Order */}
              <Button
                type="submit"
                data-ocid="new_order.submit_button"
                className="w-full h-13 text-base font-bold glow-primary shadow-elevated mt-2"
                style={{ height: "3.25rem" }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Place Order — {formatPrice(price)}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirmation Dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent data-ocid="new_order.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Confirm Order
            </DialogTitle>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5 text-sm">
                <Row label="Service" value={selectedService.name} />
                <Row label="Link" value={link} truncate />
                <Row
                  label="Quantity"
                  value={Number(quantity).toLocaleString()}
                />
                <Row
                  label="Est. Delivery"
                  value={selectedService.deliveryTime}
                />
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Total Charge</span>
                  <span className="text-xl font-display font-bold text-primary">
                    {formatPrice(price)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="new_order.cancel_button"
                  className="flex-1 h-11"
                  onClick={() => setConfirmOpen(false)}
                  disabled={isPlacingOrder}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  data-ocid="new_order.confirm_button"
                  className="flex-1 h-11 font-semibold glow-primary"
                  onClick={onConfirmOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 0.8,
                          ease: "linear",
                        }}
                        className="inline-block mr-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </motion.span>
                      Placing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`font-medium text-right ${truncate ? "truncate max-w-[200px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
