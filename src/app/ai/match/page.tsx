"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

function AIMatchContent() {
  const searchParams = useSearchParams();
  const tourId = searchParams.get("tourId");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tourId) {
      handleMatch();
    }
  }, [tourId]);

  const handleMatch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/match?tourId=${tourId}`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Error matching:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold">Lunavia AI Matching</h1>
        </div>
        <p className="text-muted-foreground">
          Độ chính xác matching: 92%
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p>Đang phân tích và match HDV...</p>
        </div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Chưa có tour được chọn. Vui lòng chọn tour để match HDV.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => (
            <Card key={match.guideId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>HDV #{index + 1}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ID: {match.guideId}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {(match.score * 100).toFixed(0)}% match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">Lý do phù hợp:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {match.reasons.map((reason: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button className="mt-4">Xem Profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIMatchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Đang tải...</div>}>
      <AIMatchContent />
    </Suspense>
  );
}

