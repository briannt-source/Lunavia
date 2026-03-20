"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Crown } from "lucide-react";

// Subscription plans (read-only, design-only)
const PLANS = {
  FREE: {
    name: "Free",
    features: ["Tạo tour cơ bản", "Tối đa 5 tours/tháng"],
  },
  TRIAL: {
    name: "Trial",
    features: ["Tất cả tính năng Free", "Tối đa 20 tours/tháng", "Hỗ trợ ưu tiên"],
  },
  PRO: {
    name: "Pro",
    features: [
      "Tất cả tính năng Trial",
      "Không giới hạn tours",
      "Hỗ trợ 24/7",
      "Analytics nâng cao",
    ],
  },
};

type PlanType = "FREE" | "TRIAL" | "PRO";

export default function SubscriptionPage() {
  // In a real implementation, this would come from API
  // For MVP, showing read-only view with placeholder data
  const currentPlanValue: PlanType = "FREE"; // Would be fetched from API
  const currentPlan = currentPlanValue as PlanType; // Use variable to avoid type narrowing
  const trialDaysLeft: number | null = null; // Would be fetched from API
  const isExpired = false; // Would be fetched from API

  const planInfo = PLANS[currentPlan] || PLANS.FREE;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Subscription</h1>
          <p className="text-gray-500">Quản lý gói đăng ký của bạn</p>
        </div>

        {/* Current Plan */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Gói Hiện Tại
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
              <p className="text-sm text-gray-500 mb-2">Tính năng bao gồm:</p>
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
                      Còn {trialDaysLeft} ngày dùng thử
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Nâng cấp lên Pro để tiếp tục sử dụng tất cả tính năng
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
                    <p className="text-sm font-medium text-red-900">Gói đã hết hạn</p>
                    <p className="text-xs text-red-700 mt-1">
                      Bạn đã quay về gói Free. Nâng cấp để tiếp tục sử dụng tính năng Pro.
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
                Nâng Cấp Lên Pro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Nâng cấp để mở khóa tất cả tính năng và không giới hạn số lượng tours.
              </p>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                disabled
              >
                Nâng Cấp (Sắp có)
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Tính năng thanh toán đang được phát triển
              </p>
            </CardContent>
          </Card>
        )}

        {/* Plan Comparison (Read-only) */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              So Sánh Gói
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-gray-500 font-medium">Tính năng</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Free</th>
                    <th className="text-center p-3 text-gray-500 font-medium">Trial</th>
                    <th className="text-center p-3 text-indigo-600 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 text-gray-900">Số tours/tháng</td>
                    <td className="p-3 text-center text-gray-500">5</td>
                    <td className="p-3 text-center text-gray-500">20</td>
                    <td className="p-3 text-center text-gray-900 font-medium">Không giới hạn</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 text-gray-900">Hỗ trợ</td>
                    <td className="p-3 text-center text-gray-500">Email</td>
                    <td className="p-3 text-center text-gray-500">Ưu tiên</td>
                    <td className="p-3 text-center text-gray-900 font-medium">24/7</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-900">Analytics</td>
                    <td className="p-3 text-center text-gray-500">Cơ bản</td>
                    <td className="p-3 text-center text-gray-500">Cơ bản</td>
                    <td className="p-3 text-center text-gray-900 font-medium">Nâng cao</td>
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

