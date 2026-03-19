"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ToursPage() {
  // Redirect to appropriate V2 dashboard tours page
  redirect("/dashboard/operator/tours");
}
