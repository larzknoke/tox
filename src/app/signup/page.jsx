"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { saveSignupAddressesAction } from "./actions/save-signup-addresses";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STEPS = [1, 2, 3];

const EMPTY_ADDRESS = {
  label: "",
  firstName: "",
  lastName: "",
  company: "",
  vat: "",
  address1: "",
  address2: "",
  postalCode: "",
  city: "",
  country: "",
  phone: "",
};

function AddressFields({
  title,
  address,
  onChange,
  showVat = false,
  disabled = false,
  t,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>

      <div className="space-y-2">
        <Label htmlFor="label">{t("signup.fields.label")}</Label>
        <Input
          id="label"
          placeholder={t("signup.placeholders.addressLabel")}
          value={address.label}
          onChange={(e) => onChange({ ...address, label: e.target.value })}
          disabled={disabled}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("signup.fields.firstName")}</Label>
          <Input
            id="firstName"
            value={address.firstName}
            onChange={(e) =>
              onChange({ ...address, firstName: e.target.value })
            }
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("signup.fields.lastName")}</Label>
          <Input
            id="lastName"
            value={address.lastName}
            onChange={(e) => onChange({ ...address, lastName: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">{t("signup.fields.company")}</Label>
        <Input
          id="company"
          value={address.company}
          onChange={(e) => onChange({ ...address, company: e.target.value })}
          disabled={disabled}
          required
        />
      </div>

      {showVat && (
        <div className="space-y-2">
          <Label htmlFor="vat">{t("signup.fields.vatOptional")}</Label>
          <Input
            id="vat"
            value={address.vat}
            onChange={(e) => onChange({ ...address, vat: e.target.value })}
            disabled={disabled}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="address1">{t("signup.fields.address1")}</Label>
        <Input
          id="address1"
          value={address.address1}
          onChange={(e) => onChange({ ...address, address1: e.target.value })}
          disabled={disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address2">{t("signup.fields.address2Optional")}</Label>
        <Input
          id="address2"
          value={address.address2}
          onChange={(e) => onChange({ ...address, address2: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">{t("signup.fields.postalCode")}</Label>
          <Input
            id="postalCode"
            value={address.postalCode}
            onChange={(e) =>
              onChange({ ...address, postalCode: e.target.value })
            }
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("signup.fields.city")}</Label>
          <Input
            id="city"
            value={address.city}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">{t("signup.fields.country")}</Label>
          <Input
            id="country"
            value={address.country}
            onChange={(e) => onChange({ ...address, country: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("signup.fields.phone")}</Label>
          <Input
            id="phone"
            value={address.phone}
            onChange={(e) => onChange({ ...address, phone: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const { t } = useLocale();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [deliveryAddress, setDeliveryAddress] = useState({ ...EMPTY_ADDRESS });
  const [billingAddress, setBillingAddress] = useState({ ...EMPTY_ADDRESS });
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (!billingSameAsDelivery) {
      return;
    }

    setBillingAddress((previous) => ({
      ...previous,
      ...deliveryAddress,
      label: previous.label || deliveryAddress.label,
    }));
  }, [billingSameAsDelivery, deliveryAddress]);

  const validateAccountStep = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      return t("signup.validation.nameEmailRequired");
    }
    if (!formData.password || !formData.confirmPassword) {
      return t("signup.validation.passwordsRequired");
    }
    if (formData.password.length < 8) {
      return t("signup.validation.passwordMinLength");
    }
    if (formData.password !== formData.confirmPassword) {
      return t("signup.validation.passwordsDoNotMatch");
    }
    return null;
  };

  const validateAddress = (address) => {
    const fieldLabels = {
      label: t("signup.fields.label"),
      firstName: t("signup.fields.firstName"),
      lastName: t("signup.fields.lastName"),
      company: t("signup.fields.company"),
      address1: t("signup.fields.address1"),
      postalCode: t("signup.fields.postalCode"),
      city: t("signup.fields.city"),
      country: t("signup.fields.country"),
      phone: t("signup.fields.phone"),
    };

    const requiredFields = [
      "label",
      "firstName",
      "lastName",
      "company",
      "address1",
      "postalCode",
      "city",
      "country",
      "phone",
    ];

    const missing = requiredFields
      .filter((field) => !address[field]?.trim())
      .map((field) => fieldLabels[field]);

    if (missing.length > 0) {
      return t("signup.validation.addressRequiredFields", {
        fields: missing.join(", "),
      });
    }

    return null;
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      const accountError = validateAccountStep();
      if (accountError) {
        toast.error(accountError);
        return;
      }
    }

    if (currentStep === 2) {
      const deliveryError = validateAddress(deliveryAddress);
      if (deliveryError) {
        toast.error(deliveryError);
        return;
      }
    }

    setCurrentStep((previous) => Math.min(previous + 1, STEPS.length));
  };

  const goToPreviousStep = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (currentStep !== 3) {
      goToNextStep();
      return;
    }

    const finalBillingAddress = billingSameAsDelivery
      ? {
          ...deliveryAddress,
          label: billingAddress.label || deliveryAddress.label,
          vat: billingAddress.vat,
        }
      : billingAddress;

    const billingError = validateAddress(finalBillingAddress);
    if (billingError) {
      toast.error(billingError);
      return;
    }

    setLoading(true);

    try {
      const response = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/auth/verify-email-pending?approval=pending",
      });

      if (response?.error) {
        const message =
          response.error.message || t("signup.feedback.signupError");
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      const saveAddressesResult = await saveSignupAddressesAction({
        email: formData.email,
        deliveryAddress,
        billingAddress: finalBillingAddress,
      });

      if (!saveAddressesResult.success) {
        const message =
          saveAddressesResult.error || t("signup.feedback.addressSaveError");
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      setVerificationSent(true);
      setLoading(false);
      toast.success(t("signup.feedback.registrationSuccess"));
    } catch (err) {
      const message = err?.message || t("signup.feedback.genericError");
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <Ticket className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">
              {t("signup.completed.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("signup.completed.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-2">
              <p className="text-sm text-blue-900 text-center">
                {t("signup.completed.verificationSent", {
                  email: formData.email,
                })}
              </p>
              <p className="text-sm text-blue-900 text-center">
                {t("signup.completed.waitForApproval")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t("signup.completed.spamHint")}
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/signin" className="w-full">
              <Button variant="outline" className="w-full">
                {t("signup.buttons.backToSignIn")}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <Ticket className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">
            {t("signup.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("signup.subtitle")}
          </CardDescription>

          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step) => {
              const isActive = currentStep === step;
              const isDone = currentStep > step;
              return (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={`mx-auto mb-2 h-8 w-8 rounded-full border flex items-center justify-center text-xs font-semibold ${
                      isDone
                        ? "bg-primary text-primary-foreground border-primary"
                        : isActive
                          ? "border-primary text-primary"
                          : "border-muted-foreground/30 text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(`signup.steps.${step}`)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("signup.fields.name")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("signup.placeholders.name")}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("signup.fields.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("signup.placeholders.email")}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t("signup.fields.password")}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={8}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("signup.validation.passwordMinLength")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("signup.fields.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <AddressFields
                title={t("signup.deliveryTitle")}
                address={deliveryAddress}
                onChange={setDeliveryAddress}
                disabled={loading}
                t={t}
              />
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="sameAsDelivery"
                    type="checkbox"
                    checked={billingSameAsDelivery}
                    onChange={(e) => setBillingSameAsDelivery(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                    disabled={loading}
                  />
                  <Label
                    htmlFor="sameAsDelivery"
                    className="text-sm cursor-pointer"
                  >
                    {t("signup.sameAsDelivery")}
                  </Label>
                </div>

                <AddressFields
                  title={t("signup.billingTitle")}
                  address={billingAddress}
                  onChange={setBillingAddress}
                  showVat
                  disabled={loading || billingSameAsDelivery}
                  t={t}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-4">
            <div className="flex w-full justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={goToPreviousStep}
                disabled={loading || currentStep === 1}
              >
                {t("signup.buttons.back")}
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading
                  ? t("signup.buttons.creating")
                  : currentStep === 3
                    ? t("signup.buttons.complete")
                    : t("signup.buttons.next")}
              </Button>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              {t("signup.alreadyHaveAccount")}{" "}
              <Link href="/signin" className="text-primary hover:underline">
                {t("signup.buttons.signIn")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
