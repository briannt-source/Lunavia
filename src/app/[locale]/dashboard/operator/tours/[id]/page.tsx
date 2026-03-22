"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Link } from '@/navigation';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tour state mapping for display
const TOUR_STATES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  PUBLISHED: { label: "Published", color: "bg-blue-100 text-blue-700" },
  ASSIGNED: { label: "Assigned", color: "bg-purple-100 text-purple-700" },
  CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700" },
};

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const tourId = params.id as string;

  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [transitionData, setTransitionData] = useState({
    toState: "",
    reason: "",
  });
  const [sosReason, setSosReason] = useState("");
  const [disputeData, setDisputeData] = useState({
    reason: "",
    type: "QUALITY",
    evidence: "",
  });

  // Fetch tour details
  const { data: tour, isLoading } = useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => api.tours.get(tourId),
  });

  // Fetch applications to get assigned guides
  const { data: applications = [] } = useQuery({
    queryKey: ["tour", tourId, "applications"],
    queryFn: () => api.tours.getApplications(tourId, { status: "ACCEPTED" }),
    enabled: !!tourId,
  });

  // Fetch disputes for this tour
  const { data: disputes = [] } = useQuery({
    queryKey: ["disputes", tourId],
    queryFn: () => api.disputes.list({ tourId }),
    enabled: !!tourId,
  });

  // Transition state mutation
  const transitionMutation = useMutation({
    mutationFn: (data: { fromState: string; toState: string; reason?: string }) =>
      api.tours.transitionState(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour", tourId] });
      setTransitionDialogOpen(false);
      setTransitionData({ toState: "", reason: "" });
      toast.success("Tour state updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to transition tour state");
    },
  });

  // Trigger SOS mutation
  const sosMutation = useMutation({
    mutationFn: (reason: string) => api.tours.triggerSOS(tourId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour", tourId] });
      queryClient.invalidateQueries({ queryKey: ["ops", "overview"] });
      setSosDialogOpen(false);
      setSosReason("");
      toast.success("SOS triggered successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to trigger SOS");
    },
  });

  // Open dispute mutation
  const disputeMutation = useMutation({
    mutationFn: (data: { tourId: string; reason: string; type: string; evidence?: string[] }) =>
      api.disputes.open(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes", tourId] });
      setDisputeDialogOpen(false);
      setDisputeData({ reason: "", type: "QUALITY", evidence: "" });
      toast.success("Dispute opened successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to open dispute");
    },
  });

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </>
    );
  }

  if (!tour) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Tour does not exist</p>
        </div>
      </>
    );
  }

  const currentState = tour.status as keyof typeof TOUR_STATES;
  const stateInfo = TOUR_STATES[currentState] || {
    label: currentState,
    color: "bg-gray-100 text-gray-700",
  };

  const assignedGuides = applications.filter((app: any) => app.status === "ACCEPTED");
  const activeDisputes = disputes.filter(
    (d: any) => d.status === "PENDING" || d.status === "IN_REVIEW"
  );

  // Get allowed next states (simplified - would need policy check from backend)
  const getAllowedNextStates = (current: string) => {
    const transitions: Record<string, string[]> = {
      DRAFT: ["PUBLISHED", "CANCELLED"],
      PUBLISHED: ["ASSIGNED", "CANCELLED"],
      ASSIGNED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED", "FAILED"],
      COMPLETED: [],
      CANCELLED: [],
      FAILED: [],
    };
    return transitions[current] || [];
  };

  const allowedStates = getAllowedNextStates(currentState);

  const handleTransition = () => {
    if (!transitionData.toState) {
      toast.error("Please select a new status");
      return;
    }
    transitionMutation.mutate({
      fromState: currentState,
      toState: transitionData.toState,
      reason: transitionData.reason || undefined,
    });
  };

  const handleSOS = () => {
    if (!sosReason.trim()) {
      toast.error("Please enter SOS activation reason");
      return;
    }
    sosMutation.mutate(sosReason);
  };

  const handleOpenDispute = () => {
    if (!disputeData.reason.trim()) {
      toast.error("Please enter dispute reason");
      return;
    }
    disputeMutation.mutate({
      tourId,
      reason: disputeData.reason,
      type: disputeData.type,
      evidence: disputeData.evidence
        ? disputeData.evidence.split(",").map((e) => e.trim())
        : undefined,
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/operator/tours">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{tour.title}</h1>
              <p className="text-gray-500 mt-1">
                {tour.city} • {format(new Date(tour.startDate), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          <Badge className={`${stateInfo.color} border-0`}>{stateInfo.label}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Info */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Tour Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Start date</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(tour.startDate), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  {tour.endDate && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">End date</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(tour.endDate), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium text-gray-900">{tour.city}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Number of guests</p>
                      <p className="font-medium text-gray-900">{tour.pax}</p>
                    </div>
                  </div>
                </div>
                {tour.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Description</p>
                    <p className="text-gray-900">{tour.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assigned Guides */}
            {assignedGuides.length > 0 && (
              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Assigned Guides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignedGuides.map((app: any) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-lg bg-gray-50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {app.guide?.profile?.name || app.guide?.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.role === "MAIN" ? "Lead Guide" : "Sub Guide"}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-green-300 text-green-700">
                          Accepted
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Disputes */}
            {activeDisputes.length > 0 && (
              <Card className="rounded-xl shadow-sm border-amber-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Open Disputes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeDisputes.map((dispute: any) => (
                      <Link
                        key={dispute.id}
                        href={`/dashboard/operator/disputes/${dispute.id}`}
                        className="block p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {dispute.type} • {dispute.status}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {dispute.description}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-amber-300 text-amber-700"
                          >
                            {dispute.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Transition State */}
                {allowedStates.length > 0 && (
                  <Button
                    onClick={() => setTransitionDialogOpen(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  >
                    Change Status
                  </Button>
                )}

                {/* Trigger SOS */}
                {(currentState === "CONFIRMED" || currentState === "IN_PROGRESS") && (
                  <Button
                    onClick={() => setSosDialogOpen(true)}
                    variant="destructive"
                    className="w-full rounded-xl"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Activate SOS
                  </Button>
                )}

                {/* Open Dispute */}
                {currentState !== "DRAFT" &&
                  currentState !== "CANCELLED" &&
                  activeDisputes.length === 0 && (
                    <Button
                      onClick={() => setDisputeDialogOpen(true)}
                      variant="outline"
                      className="w-full border-indigo-600 text-indigo-700 hover:bg-indigo-50 rounded-xl"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Open Dispute
                    </Button>
                  )}
              </CardContent>
            </Card>

            {/* Timeline (Simplified) */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{stateInfo.label}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(tour.updatedAt || tour.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transition State Dialog */}
      <Dialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Change Status Tour</DialogTitle>
            <DialogDescription>
              Select a new status for this tour. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Current Status
              </label>
              <Input value={stateInfo.label} disabled className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                New Status
              </label>
              <Select
                value={transitionData.toState}
                onValueChange={(value) =>
                  setTransitionData({ ...transitionData, toState: value })
                }
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {TOUR_STATES[state as keyof typeof TOUR_STATES]?.label || state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Reason (optional)
              </label>
              <Textarea
                value={transitionData.reason}
                onChange={(e) =>
                  setTransitionData({ ...transitionData, reason: e.target.value })
                }
                placeholder="Enter reason for status change..."
                className="rounded-lg"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransitionDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransition}
              disabled={!transitionData.toState || transitionMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              {transitionMutation.isPending ? "Processing..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SOS Dialog */}
      <Dialog open={sosDialogOpen} onOpenChange={setSosDialogOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Activate SOS
            </DialogTitle>
            <DialogDescription>
              <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium">
                  Warning: SOS should only be activated in genuine emergencies.
                </p>
                <p className="text-xs text-red-700 mt-1">
                  The system will search for a replacement guide. If not found, the tour will be marked
                  as FAILED.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                SOS Activation Reason <span className="text-red-600">*</span>
              </label>
              <Textarea
                value={sosReason}
                onChange={(e) => setSosReason(e.target.value)}
                placeholder="Describe the reason for SOS activation..."
                className="rounded-lg"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSosDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSOS}
              disabled={!sosReason.trim() || sosMutation.isPending}
              variant="destructive"
              className="rounded-xl"
            >
              {sosMutation.isPending ? "Processing..." : "Confirm SOS Activation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open Dispute Dialog */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>Open Dispute</DialogTitle>
            <DialogDescription>
              Open a dispute to request a refund or resolve issues with this tour.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Type dispute
              </label>
              <Select
                value={disputeData.type}
                onValueChange={(value) => setDisputeData({ ...disputeData, type: value })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                  <SelectItem value="QUALITY">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Reason <span className="text-red-600">*</span>
              </label>
              <Textarea
                value={disputeData.reason}
                onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                placeholder="Describe the issue in detail..."
                className="rounded-lg"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Evidence (URLs, separated by commas)
              </label>
              <Input
                value={disputeData.evidence}
                onChange={(e) => setDisputeData({ ...disputeData, evidence: e.target.value })}
                placeholder="https://example.com/evidence1.jpg, https://example.com/evidence2.jpg"
                className="rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDisputeDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOpenDispute}
              disabled={!disputeData.reason.trim() || disputeMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              {disputeMutation.isPending ? "Processing..." : "Open Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

