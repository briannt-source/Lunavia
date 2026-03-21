"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Users,
  Search,
  Calendar,
  DollarSign,
  Star,
  Eye,
  Briefcase,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BrowsePage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [tourFilters, setTourFilters] = useState({
    city: "all",
    search: "",
  });

  const [guideFilters, setGuideFilters] = useState({
    city: "all",
    search: "",
    availabilityStatus: "all",
  });

  // Fetch tours - only public and open for guides
  const { data: toursData } = useQuery({
    queryKey: ["tours", "browse", tourFilters],
    queryFn: () =>
      api.tours.list({
        city: tourFilters.city && tourFilters.city !== "all" ? tourFilters.city : undefined,
        search: tourFilters.search || undefined,
      }),
  });

  const tours = toursData || [];
  // Only show PUBLIC and OPEN tours in marketplace (for all users)
  const filteredTours = tours.filter(
    (t: any) => t.visibility === "PUBLIC" && t.status === "OPEN"
  );

  // Fetch guides - only for operators
  const { data: guidesData } = useQuery({
    queryKey: ["guides", "browse", guideFilters],
    queryFn: () =>
      api.guides.list({
        city: guideFilters.city && guideFilters.city !== "all" ? guideFilters.city : undefined,
        search: guideFilters.search || undefined,
        availabilityStatus: guideFilters.availabilityStatus && guideFilters.availabilityStatus !== "all" ? guideFilters.availabilityStatus : undefined,
      }),
    enabled: role === "TOUR_OPERATOR" || role === "TOUR_AGENCY",
  });

  const guides = guidesData?.guides || [];

  return (
    <DashboardLayout>
      <PageHeader
        title={
          role === "TOUR_GUIDE"
            ? "Find Tours"
            : "Browse Tours & Guides"
        }
        description={
          role === "TOUR_GUIDE"
            ? "Find and apply for suitable tours"
            : "Find tours and guides for your project"
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tours Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {role === "TOUR_GUIDE" ? "Open Tours" : "Public Tours"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tour Filters */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search tours..."
                    value={tourFilters.search}
                    onChange={(e) =>
                      setTourFilters({ ...tourFilters, search: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                <Select
                  value={tourFilters.city}
                  onValueChange={(value) =>
                    setTourFilters({ ...tourFilters, city: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cities</SelectItem>
                    <SelectItem value="Hanoi">Hanoi</SelectItem>
                    <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                    <SelectItem value="Da Nang">Da Nang</SelectItem>
                    <SelectItem value="Hoi An">Hoi An</SelectItem>
                    <SelectItem value="Da Lat">Da Lat</SelectItem>
                    <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tours List */}
              {filteredTours.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="No tours available"
                  description={
                    role === "TOUR_GUIDE"
                      ? "No public tours currently open"
                      : "No public tours available"
                  }
                />
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredTours.map((tour: any) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.id}`}
                      className="block p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">
                              {tour.title}
                            </h3>
                            {tour.code && (
                              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-300 font-mono">
                                {tour.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{tour.city}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(tour.startDate)}</span>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                            {tour.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{tour.pax} guests</span>
                            {tour.priceMain && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(tour.priceMain, tour.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={tour.status} />
                      </div>
                      {role === "TOUR_GUIDE" && tour.status === "OPEN" && (
                        <div className="mt-3 pt-3 border-t">
                          <Link href={`/tours/${tour.id}`}>
                            <Button size="sm" className="w-full">
                              <Briefcase className="h-4 w-4 mr-2" />
                              Ứng tuyển
                            </Button>
                          </Link>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guides Section - Only for Operators */}
        {(role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Available Tour Guides
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Guide Filters */}
                <div className="mb-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Find guides..."
                      value={guideFilters.search}
                      onChange={(e) =>
                        setGuideFilters({
                          ...guideFilters,
                          search: e.target.value,
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={guideFilters.city}
                      onValueChange={(value) =>
                        setGuideFilters({ ...guideFilters, city: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="Hanoi">Hanoi</SelectItem>
                        <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                        <SelectItem value="Da Nang">Da Nang</SelectItem>
                        <SelectItem value="Hoi An">Hoi An</SelectItem>
                        <SelectItem value="Da Lat">Da Lat</SelectItem>
                        <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={guideFilters.availabilityStatus}
                      onValueChange={(value) =>
                        setGuideFilters({
                          ...guideFilters,
                          availabilityStatus: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                        <SelectItem value="BUSY">Bận</SelectItem>
                        <SelectItem value="ON_TOUR">Đang tour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Guides List */}
                {guides.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No guides available"
                    description="No matching guides found"
                  />
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {guides.map((guide: any) => (
                      <div
                        key={guide.id}
                        className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage
                              src={guide.profile?.photoUrl}
                              alt={guide.profile?.name}
                            />
                            <AvatarFallback>
                              {guide.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">
                                {guide.profile?.name || guide.email}
                              </h3>
                              {guide.verifiedStatus === "APPROVED" && (
                                <VerifiedBadge type="KYC" />
                              )}
                              {guide.profile?.availabilityStatus && (
                                <StatusBadge
                                  status={guide.profile.availabilityStatus}
                                />
                              )}
                            </div>
                            {guide.profile?.bio && (
                              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                {guide.profile.bio}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                              {guide.profile?.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {guide.profile.rating.toFixed(1)} (
                                  {guide.profile.reviewCount || 0})
                                </span>
                              )}
                              {guide._count?.applications > 0 && (
                                <span>
                                  {guide._count.applications} tours hoàn thành
                                </span>
                              )}
                            </div>
                            {guide.profile?.languages &&
                              guide.profile.languages.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {guide.profile.languages
                                    .slice(0, 3)
                                    .map((lang: string) => (
                                      <span
                                        key={lang}
                                        className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs"
                                      >
                                        {lang}
                                      </span>
                                    ))}
                                </div>
                              )}
                            {guide.profile?.specialties &&
                              guide.profile.specialties.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {guide.profile.specialties
                                    .slice(0, 3)
                                    .map((spec: string) => (
                                      <span
                                        key={spec}
                                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs"
                                      >
                                        {spec}
                                      </span>
                                    ))}
                                </div>
                              )}
                          </div>
                          <Link href={`/guides/${guide.id}/profile`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              Xem
                            </Button>
                          </Link>
                        </div>
                        {guide.companyMember && (
                          <div className="mt-2 pt-2 border-t text-xs text-slate-500">
                            In-house tại: {guide.companyMember.company.name} (
                            {guide.companyMember.company.companyId})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* For Guides: Show only tours in full width */}
        {role === "TOUR_GUIDE" && (
          <div className="lg:col-span-2">
            {/* Tours already shown above */}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}




