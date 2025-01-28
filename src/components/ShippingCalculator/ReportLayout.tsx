import React from 'react';

const ReportLayout = ({ data }) => {
  if (!data) return <div>Loading...</div>;

  const quoteNo = Math.random().toString(36).substr(2, 9).toUpperCase();
  const date = new Date().toLocaleDateString();
  const calculateFreightCost = () => data.chargeableWeight * data.appliedRate;

  return (
    <div className="w-[210mm] mx-auto bg-white p-12">
      <h1 className="text-2xl font-bold text-center mb-8">
        Export Shipping Cost Quote
      </h1>
      
      <div className="grid grid-cols-2 gap-y-4">
        <div className="flex">
          <span className="font-bold w-36">Company Name:</span>
          <span>{data.companyInfo.companyName}</span>
        </div>
        <div className="flex justify-end">
          <span className="font-bold w-28">Destination:</span>
          <span className="w-32">{data.destination}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">Contact Person:</span>
          <span>{data.companyInfo.contactPerson}</span>
        </div>
        <div className="flex justify-end">
          <span className="font-bold w-28">Quote No:</span>
          <span className="w-32">{quoteNo}</span>
        </div>
        <div className="flex">
          <span className="font-bold w-36">Contact No:</span>
          <span>{data.companyInfo.contactNo}</span>
        </div>
        <div className="flex justify-end">
          <span className="font-bold w-28">Date:</span>
          <span className="w-32">{date}</span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold border-b border-black pb-1 mb-4">
          Dimensions
        </h2>
        <div className="flex justify-between px-4">
          <span>Length: {data.dimensions.length}cm</span>
          <span>Width: {data.dimensions.width}cm</span>
          <span>Height: {data.dimensions.height}cm</span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold border-b border-black pb-1 mb-4">
          Weight Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span>Volume Weight per Pallet:</span>
            <span>{data.volumeWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Total Volume Weight:</span>
            <span>{data.totalVolumeWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Actual Weight per Pallet:</span>
            <span>{data.actualWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Total Actual Weight:</span>
            <span>{data.totalActualWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Chargeable Weight:</span>
            <span>{data.chargeableWeight} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Number of Pallets:</span>
            <span>{data.palletCount}</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-bold border-b border-black pb-1 mb-4">
          Cost Breakdown
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Freight Cost ({data.appliedRate}/kg × {data.chargeableWeight}kg):</span>
            <span>฿{calculateFreightCost().toLocaleString()}</span>
          </div>
          {data.charges.delivery.required && data.charges.delivery.vehicle && (
            <div className="flex justify-between">
              <span>Delivery Charge ({data.charges.delivery.vehicle === '4wheel' ? '4 Wheels' : '6 Wheels'}):</span>
              <span>฿{data.charges.delivery.rates[data.charges.delivery.vehicle].toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Clearance Charge (Include 7% VAT):</span>
            <span>฿{data.charges.clearance.toLocaleString()}</span>
          </div>
          {data.charges.additionalCharges.map((charge, index) => (
            <div key={index} className="flex justify-between">
              <span>{charge.name}:</span>
              <span>฿{charge.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t border-black font-bold">
            <span>Total Cost:</span>
            <span>฿{data.totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-black text-sm">
        <p>Rate validity: 30 days from quote date</p>
        <p>Note: All prices are exclusive of VAT</p>
      </div>
    </div>
  );
};

export default ReportLayout;