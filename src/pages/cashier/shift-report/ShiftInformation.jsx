import { Card, CardContent } from "@/components/ui/card";
import React from "react";

const formatDateTime = (dateTime) => {
  if (!dateTime) return 'ongoing';
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const calculateDuration = (start, end) => {
  if (!start) return '0 hours';
  const startTime = new Date(start);
  const endTime = end ? new Date(end) : new Date();
  const diffMs = endTime - startTime;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  return `${diffHours} hours`;
};

const ShiftInformation = ({ shiftData }) => {
  if (!shiftData) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Shift Information</h2>
          <p className="text-sm text-muted-foreground">No shift data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Shift Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cashier:</span>
            <span className="font-medium">{shiftData.cashier?.fullName || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shift Start:</span>
            <span className="font-medium">{formatDateTime(shiftData.shiftStart)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shift End:</span>
            <span className="font-medium">{shiftData.shiftEnd ? formatDateTime(shiftData.shiftEnd) : 'ongoing'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{calculateDuration(shiftData.shiftStart, shiftData.shiftEnd)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftInformation;
