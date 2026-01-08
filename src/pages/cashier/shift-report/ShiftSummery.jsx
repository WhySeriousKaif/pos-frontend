import React, { useState, useEffect } from "react";
import ShiftReportHeader from "./ShiftReportHeader";
import ShiftInformation from "./ShiftInformation";
import SalesSummery from "./SalesSummery";
import PaymentSummery from "./PaymentSummery";
import TopSellingItems from "./TopSellingItems";
import RecentOrders from "./RecentOrders";
import RefundsTable from "./RefundsTable";
import { shiftReportAPI } from "@/services/api";

const ShiftSummery = () => {
  const [shiftData, setShiftData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShiftData();
  }, []);

  const fetchShiftData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try to get current shift progress (use cashierId=1 for testing)
      const data = await shiftReportAPI.getCurrent(1);
      setShiftData(data);
    } catch (err) {
      console.error('Error fetching shift data:', err);
      setError(err.message);
      // Set mock data for testing if API fails
      setShiftData({
        cashier: { fullName: 'vinod' },
        shiftStart: '2025-08-08T09:34:00',
        shiftEnd: null,
        totalOrders: 1,
        totalSales: 599.00,
        totalRefunds: 599.00,
        netSale: 0.00,
        paymentSummaries: [
          { type: 'CARD', totalAmount: 599.00, transactionCount: 1, percentage: 100.0 }
        ],
        topSellingProducts: [
          { id: 1, name: 'Men Geometric Print Polo Neck Pure Cotton Black T-Shirt', sellingPrice: 599.00, quantity: 1 }
        ],
        recentOrders: [],
        refunds: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEndShift = async () => {
    try {
      if (shiftData?.id) {
        await shiftReportAPI.endShift(shiftData.id);
      }
      // Clear auth and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } catch (err) {
      console.error('Error ending shift:', err);
      // Still logout even if ending shift fails
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading shift data...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      <ShiftReportHeader onPrint={handlePrint} onEndShift={handleEndShift} />
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ShiftInformation shiftData={shiftData} />
          <SalesSummery shiftData={shiftData} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <PaymentSummery paymentSummaries={shiftData?.paymentSummaries} />
          <TopSellingItems topSellingProducts={shiftData?.topSellingProducts} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <RecentOrders recentOrders={shiftData?.recentOrders} />
          <RefundsTable refunds={shiftData?.refunds} />
        </div>
      </div>
    </div>
  );
};

export default ShiftSummery;
