"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Check, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DateTimePickerProps {
  label?: string;
  value: Date | string | null;
  onChange: (value: string) => void;
  required?: boolean;
  min?: Date | string; // ISO datetime string or Date for min date
  placeholder?: string;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  min,
  placeholder = "Select date and time",
}: DateTimePickerProps) {
  const t = useTranslations("Components.DateTimePicker");
  // Parse value to local date and time
  const parseValue = (val: Date | string | null | undefined) => {
    if (!val) return { date: "", time: "" };
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return { date: "", time: "" };
    
    // Get local date and time (not UTC)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  };

  // Convert min to string if it's a Date
  const getMinDateString = () => {
    if (!min) return undefined;
    if (min instanceof Date) {
      const year = min.getFullYear();
      const month = String(min.getMonth() + 1).padStart(2, "0");
      const day = String(min.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return min.split("T")[0];
  };

  const getInitialDate = () => {
    return parseValue(value);
  };

  const [date, setDate] = useState(() => getInitialDate());
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(date);

  // Update when value changes externally
  useEffect(() => {
    const parsed = parseValue(value);
    setDate(parsed);
    if (!isOpen) {
      setTempDate(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isOpen]);

  const handleConfirm = () => {
    if (tempDate.date && tempDate.time) {
      // Create date in local timezone
      const dateTime = new Date(`${tempDate.date}T${tempDate.time}`);
      if (!isNaN(dateTime.getTime())) {
        // Format as YYYY-MM-DDTHH:mm for datetime-local input (local timezone)
        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, "0");
        const day = String(dateTime.getDate()).padStart(2, "0");
        const hours = String(dateTime.getHours()).padStart(2, "0");
        const minutes = String(dateTime.getMinutes()).padStart(2, "0");
        const isoString = `${year}-${month}-${day}T${hours}:${minutes}`;
        onChange(isoString);
        setDate(tempDate);
        setIsOpen(false);
      }
    } else if (tempDate.date) {
      // If only date is selected, set time to 00:00
      const dateTime = new Date(`${tempDate.date}T00:00`);
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, "0");
      const day = String(dateTime.getDate()).padStart(2, "0");
      const isoString = `${year}-${month}-${day}T00:00`;
      onChange(isoString);
      setDate({ ...tempDate, time: "00:00" });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempDate(date);
    setIsOpen(false);
  };

  const getValueAsDate = (): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const displayValue = getValueAsDate() ? formatDateTime(getValueAsDate()!) : "";

  // Close dialog when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".date-time-picker-container")) {
          setIsOpen(false);
          setTempDate(date); // Reset to original value
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, date]);

  return (
    <div className="space-y-2 date-time-picker-container">
      {label && (
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue || (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>

        {isOpen && (
          <div
            className="absolute z-50 mt-2 w-full rounded-lg border bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Date picker */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t("selectDate")}
                </Label>
                <Input
                  type="date"
                  value={tempDate.date}
                  onChange={(e) =>
                    setTempDate({ ...tempDate, date: e.target.value })
                  }
                  min={getMinDateString()}
                  className="w-full"
                />
              </div>

              {/* Time picker */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  hours
                </Label>
                <Input
                  type="time"
                  value={tempDate.time}
                  onChange={(e) =>
                    setTempDate({ ...tempDate, time: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              {/* Preview */}
              {tempDate.date && tempDate.time && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="text-slate-600">Preview:</p>
                  <p className="font-semibold">
                    {formatDateTime(new Date(`${tempDate.date}T${tempDate.time}`))}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!tempDate.date}
                  className="flex-1"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        value={value instanceof Date ? value.toISOString() : value || ""}
        required={required}
        name={label ? label.toLowerCase().replace(/\s+/g, "_") : "datetime"}
      />
    </div>
  );
}
