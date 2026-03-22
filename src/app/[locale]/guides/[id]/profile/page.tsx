"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Star,
  DollarSign,
  Calendar,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { formatVND, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GuideProfilePage() {
  const params = useParams();
  const router = useRouter();
  const guideId = params.id as string;

  const { data: guideProfile, isLoading, error } = useQuery({
    queryKey: ["guideProfile", guideId],
    queryFn: () => api.guides.getProfile(guideId),
    enabled: !!guideId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Loading information...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !guideProfile) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={AlertCircle}
          title="Guide not found"
          description="This tour guide does not exist or has been deleted"
          action={
            <Button onClick={() => router.back()}>Back</Button>
          }
        />
      </DashboardLayout>
    );
  }

  const profile = guideProfile.profile;
  const wallet = guideProfile.wallet;
  const verification = guideProfile.verifications?.[0];
  const badges = guideProfile.badges || [];
  const stats = guideProfile.stats || {
    completedTours: 0,
    cancelledTours: 0,
    totalAcceptedApplications: 0,
    totalReviews: 0,
    averageRating: profile?.rating || 0,
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Profile Tour guide"
        description="Detailed guide information"
        action={
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {profile?.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name || "Guide"}
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lunavia-primary to-lunavia-primary flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {profile?.name || guideProfile.email}
                    </h2>
                    {badges.includes("KYC_VERIFIED") && <VerifiedBadge />}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {badges.map((badge: string) => {
                      const badgeConfig: Record<string, { label: string; className: string }> = {
                        KYC_VERIFIED: {
                          label: "KYC Verified",
                          className: "bg-green-50 text-green-700 border-green-200",
                        },
                        FREELANCE_GUIDE: {
                          label: "Freelance",
                          className: "bg-lunavia-light text-lunavia-primary-hover border-lunavia-muted/60",
                        },
                        IN_HOUSE_GUIDE: {
                          label: "In-House",
                          className: "bg-purple-50 text-purple-700 border-purple-200",
                        },
                        TOP_RATED: {
                          label: "Top Rated",
                          className: "bg-amber-50 text-amber-700 border-amber-200",
                        },
                        EXPERIENCED: {
                          label: "Experienced",
                          className: "bg-lunavia-light text-[#2E8BC0] border-[#5BA4CF]/30",
                        },
                      };
                      const config = badgeConfig[badge] || {
                        label: badge,
                        className: "bg-slate-50 text-slate-700 border-slate-200",
                      };
                      return (
                        <span
                          key={badge}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
                        >
                          {config.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Rating Display */}
                  {stats.averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.round(stats.averageRating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-slate-900">
                        {stats.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-600">
                        ({stats.totalReviews} {stats.totalReviews === 1 ? 'reviews' : 'reviews'})
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4" />
                      <span>{guideProfile.email}</span>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.address && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {profile?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills & Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile?.languages && profile.languages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-lunavia-light text-lunavia-primary-hover rounded-lg text-sm border border-lunavia-muted/60"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile?.specialties && profile.specialties.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((spec: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile?.experienceYears && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Experience</h4>
                    <p className="text-slate-600">
                      {profile.experienceYears} years of experience
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          {guideProfile.companyMember && (
            <Card>
              <CardHeader>
                <CardTitle>Information company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {guideProfile.companyMember.company.logo && (
                    <img
                      src={guideProfile.companyMember.company.logo}
                      alt={guideProfile.companyMember.company.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {guideProfile.companyMember.company.name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      ID: {guideProfile.companyMember.company.companyId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews & Testimonials */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reviews & Testimonials</CardTitle>
                {stats.totalReviews > 0 && (
                  <span className="text-sm text-slate-600">
                    {stats.totalReviews} reviews
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {guideProfile.reviewsReceived && guideProfile.reviewsReceived.length > 0 ? (
                <div className="space-y-6">
                  {guideProfile.reviewsReceived.map((review: any) => (
                    <div 
                      key={review.id} 
                      className="border border-slate-200 rounded-lg p-4 hover:border-lunavia-primary/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {review.reviewer?.profile?.photoUrl ? (
                              <img
                                src={review.reviewer.profile.photoUrl}
                                alt={review.reviewer.profile.name || "Reviewer"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-lunavia-muted/50 flex items-center justify-center">
                                <User className="h-4 w-4 text-lunavia-primary" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">
                                {review.reviewer?.profile?.name || "Anonymous"}
                              </p>
                              {review.reviewer?.profile?.companyName && (
                                <p className="text-xs text-slate-500">
                                  {review.reviewer.profile.companyName}
                                </p>
                              )}
                            </div>
                          </div>
                          {review.tour && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                              <Briefcase className="h-3 w-3" />
                              <span className="font-medium">{review.tour.title}</span>
                              {review.tour.city && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span>{review.tour.city}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      {review.comment && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-700 leading-relaxed">
                            &quot;{review.comment}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No reviews yet</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Reviews will appear after completing tours
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-bold text-slate-900">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {stats.totalReviews || 0} reviews
                </p>
              </div>
              
              {/* Completed Tours */}
              <div>
                <p className="text-sm text-slate-600 mb-1">Completed Tours</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.completedTours || 0}
                </p>
              </div>
              
              {/* Cancelled Tours */}
              <div>
                <p className="text-sm text-slate-600 mb-1">Cancelled Tours</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelledTours || 0}
                </p>
              </div>
              
              {/* Total Accepted Applications */}
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Accepted Applications</p>
                <p className="text-xl font-semibold text-slate-700">
                  {stats.totalAcceptedApplications || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Info */}
          {wallet && (
            <Card>
              <CardHeader>
                <CardTitle>Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Available Balance</p>
                  <p className="text-xl font-bold text-slate-900">
                    {formatVND(wallet.balance || 0)}
                  </p>
                </div>
                {wallet.reserved > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Deposited</p>
                    <p className="text-lg font-semibold text-slate-700">
                      {formatVND(wallet.reserved)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <StatusBadge status={guideProfile.verifiedStatus || "NOT_SUBMITTED"} />
                </div>
                {verification && (
                  <div className="text-sm text-slate-600">
                    <p>
                      <span className="font-medium">Submitted:</span>{" "}
                      {formatDate(verification.createdAt)}
                    </p>
                    {verification.updatedAt && (
                      <p>
                        <span className="font-medium">Updated:</span>{" "}
                        {formatDate(verification.updatedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

