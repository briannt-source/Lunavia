"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Crown } from "lucide-react";

// Subscription plans (read-only, design-only)
const PLANS = {
  FREE: {
    name: "Free",
    features: ["Basic tour creation", "Up to 5 tours/month"],
  },
  TRIAL: {
    name: "Trial",
    features: ["All Free features", "Up to 20 tours/month", "Priority support"],
  },
  PRO: {
    name: "Pro",
    features: [
      "All Trial features",
      "Unlimited tours",
      "24/7 support",
      "Advanced analytics",
    ],
  },
};

type PlanType = "FREE" | "TRIAL" | "PRO";

export default function SubscriptionPage() {
  const t = useTranslations("Operator.Subscription");
  // In a real implementation, this would come from API
  const currentPlanValue: PlanType = "FREE";
  const currentPlan = currentPlanValue as PlanType;
  const trialDaysLeft: number | null = null;
  const isExpired = false;

  const planInfo = PLANS[currentPlan] || PLANS.FREE;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>

        {/* Current Plan */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t("currentPlan")}
              </CardTitle>
              <Badge
                variant="outline"
                className={`${
                  currentPlan === "PRO"
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : currentPlan === "TRIAL"
                    ? "bg-amber-50 text-amber-700 border-amber-300"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                } border`}
              >
                {planInfo.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">{t("featuresIncluded")}</p>
              <ul className="space-y-2">
                {planInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-900">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {currentPlan === "TRIAL" && trialDaysLeft !== null && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {t("trialDaysLeft", { days: trialDaysLeft })}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      {t("trialUpgrade")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isExpired && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900">{t("expired")}</p>
                    <p className="text-xs text-red-700 mt-1">
                      {t("expiredDesc")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {currentPlan !== "PRO" && (
          <Card className="rounded-xl shadow-sm border-indigo-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Crown className="h-5 w-5 text-indigo-600" />
                {t("upgradeToPro")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {t("upgradeDesc")}
              </p>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                disabled
              >
                {t("upgradeBtn")}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                {t("paymentDev")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Plan Comparison (Read-only) */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("comparePlans")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-gray-500 font-medium">{t("feature")}</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Free</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Trial</th>
                    <th className="text-center p-3 text-indigo-600 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-gray-900">{t("toursPerMonth")}</td>
                    <td className="p-3 text-center text-gray-500">5</td>
                    <td className="p-3 text-center text-gray-500">20</td>
                    <td className="p-3 text-center text-gray-900 font-medium">{t("unlimited")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-gray-900">{t("support")}</td>
                    <td className="p-3 text-center text-gray-500">{t("email")}</td>
                    <td className="p-3 text-center text-gray-500">{t("priority")}</td>
                    <td className="p-3 text-center text-gray-900 font-medium">24/7</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-900">{t("analytics")}</td>
                    <td className="p-3 text-center text-gray-500">{t("basic")}</td>
                    <td className="p-3 text-center text-gray-500">{t("basic")}</td>
                    <td className="p-3 text-center text-gray-900 font-medium">{t("advanced")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
