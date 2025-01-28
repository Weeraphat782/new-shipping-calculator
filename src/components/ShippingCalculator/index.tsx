'use client'

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReportLayout from './ReportLayout';

interface Dimensions {
  length: number;
  width: number;
  height: number;
}

interface Rate {
  minWeight: number;
  maxWeight: number;
  rate: number;
}

interface DestinationRate {
  name: string;
  rates: Rate[];
}

interface DestinationRates {
  [key: string]: DestinationRate;
}

interface AdditionalCharge {
  name: string;
  amount: number;
}

interface Charges {
  delivery: {
    required: boolean;
    vehicle: '4wheel' | '6wheel' | '';
    rates: {
      '4wheel': number;
      '6wheel': number;
    };
  };
  clearance: number;
  additionalCharges: AdditionalCharge[];
}

export default function ShippingCalculator() {
  const [dimensions, setDimensions] = useState<Dimensions>({ length: 135, width: 110, height: 110 });
  const [palletCount, setPalletCount] = useState<number>(3);
  const [actualWeight, setActualWeight] = useState<number>(0);
  const [selectedDestination, setSelectedDestination] = useState<string>('swiss');
  const [showReport, setShowReport] = useState<boolean>(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    contactPerson: '',
    contactNo: ''
  });
  const [charges, setCharges] = useState<Charges>({
    delivery: {
      required: false,
      vehicle: '',
      rates: {
        '4wheel': 3500,
        '6wheel': 6500
      }
    },
    clearance: 5350,
    additionalCharges: []
  });

  const reportRef = useRef<HTMLDivElement>(null);

  const destinationRates: DestinationRates = {
    swiss: {
      name: "Switzerland",
      rates: [
        { minWeight: 1, maxWeight: 45, rate: 411 },
        { minWeight: 46, maxWeight: 100, rate: 301 },
        { minWeight: 101, maxWeight: 99999, rate: 271 }
      ]
    }
  };

  const calculateVolumeWeight = () => {
    const { length, width, height } = dimensions;
    return Math.ceil((length * width * height) / 6000);
  };

  const getChargableWeight = () => {
    const volumeWeight = calculateVolumeWeight() * palletCount;
    const totalActualWeight = actualWeight * palletCount;
    return Math.max(volumeWeight, totalActualWeight);
  };

  const getApplicableRate = (weight: number) => {
    const rates = destinationRates[selectedDestination].rates;
    const applicableRate = rates.find(
      rate => weight >= rate.minWeight && weight <= rate.maxWeight
    );
    return applicableRate ? applicableRate.rate : rates[rates.length - 1].rate;
  };

  const calculateTotalCost = () => {
    const chargableWeight = getChargableWeight();
    const rate = getApplicableRate(chargableWeight);
    const freightCost = rate * chargableWeight;
    const deliveryCharge = charges.delivery.required && charges.delivery.vehicle ? 
      charges.delivery.rates[charges.delivery.vehicle] : 0;
    const clearanceCharge = charges.clearance;
    const totalAdditionalCharges = charges.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    
    return freightCost + deliveryCharge + clearanceCharge + totalAdditionalCharges;
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current) {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: `shipping-quote-${new Date().toISOString()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          letterRendering: true,
          useCORS: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };
      
      html2pdf().set(opt).from(reportRef.current).save();
    }
  };

  return (
    <div>
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Export Cost Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={companyInfo.companyName}
                onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Person</label>
              <input
                type="text"
                value={companyInfo.contactPerson}
                onChange={(e) => setCompanyInfo({ ...companyInfo, contactPerson: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact No</label>
              <input
                type="text"
                value={companyInfo.contactNo}
                onChange={(e) => setCompanyInfo({ ...companyInfo, contactNo: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Destination</label>
            <select 
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {Object.entries(destinationRates).map(([key, destination]) => (
                <option key={key} value={key}>{destination.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Length (cm)</label>
              <input
                type="number"
                value={dimensions.length}
                onChange={(e) => setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Width (cm)</label>
              <input
                type="number"
                value={dimensions.width}
                onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height (cm)</label>
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Actual Weight per Pallet (kg)</label>
              <input
                type="number"
                value={actualWeight}
                onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Pallets</label>
              <input
                type="number"
                value={palletCount}
                onChange={(e) => setPalletCount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={charges.delivery.required}
                  onChange={(e) => setCharges({
                    ...charges,
                    delivery: { ...charges.delivery, required: e.target.checked, vehicle: '' }
                  })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Delivery Service Required</span>
              </label>
              {charges.delivery.required && (
                <div className="mt-2">
                  <select
                    value={charges.delivery.vehicle}
                    onChange={(e) => setCharges({
                      ...charges,
                      delivery: { ...charges.delivery, vehicle: e.target.value as '4wheel' | '6wheel' }
                    })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="4wheel">4 Wheels (฿3,000)</option>
                    <option value="6wheel">6 Wheels (฿4,500)</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Clearance Charge (Include 7% VAT)</label>
              <input
                type="number"
                value={charges.clearance}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Charges</label>
              <div className="space-y-2">
                {charges.additionalCharges.map((charge, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={charge.name}
                      onChange={(e) => {
                        const newCharges = [...charges.additionalCharges];
                        newCharges[index].name = e.target.value;
                        setCharges({ ...charges, additionalCharges: newCharges });
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="Charge Name"
                    />
                    <input
                      type="number"
                      value={charge.amount}
                      onChange={(e) => {
                        const newCharges = [...charges.additionalCharges];
                        newCharges[index].amount = parseFloat(e.target.value) || 0;
                        setCharges({ ...charges, additionalCharges: newCharges });
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="Amount"
                    />
                    <button 
                      onClick={() => {
                        const newCharges = charges.additionalCharges.filter((_, i) => i !== index);
                        setCharges({ ...charges, additionalCharges: newCharges });
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setCharges({
                    ...charges,
                    additionalCharges: [...charges.additionalCharges, { name: '', amount: 0 }]
                  })}
                  className="text-blue-600 hover:text-blue-700"
                >
                  + Add Charge
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Volume Weight per Pallet:</p>
                <p className="text-xl font-bold">{calculateVolumeWeight()} kg</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Volume Weight:</p>
                <p className="text-xl font-bold">{calculateVolumeWeight() * palletCount} kg</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Actual Weight:</p>
                <p className="text-xl font-bold">{actualWeight * palletCount} kg</p>
              </div>
              <div>
                <p className="text-sm font-medium">Chargeable Weight:</p>
                <p className="text-xl font-bold">{getChargableWeight()} kg</p>
              </div>
              <div>
                <p className="text-sm font-medium">Applied Rate:</p>
                <p className="text-xl font-bold">฿{getApplicableRate(getChargableWeight())}/kg</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Cost:</p>
                <p className="text-xl font-bold">฿{calculateTotalCost().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showReport ? 'Hide Report' : 'Generate Report'}
          </button>
        </CardContent>
      </Card>

      {showReport && (
        <div>
          <div ref={reportRef}>
            <ReportLayout
              data={{
                dimensions,
                palletCount,
                actualWeight,
                destination: destinationRates[selectedDestination].name,
                volumeWeight: calculateVolumeWeight(),
                totalVolumeWeight: calculateVolumeWeight() * palletCount,
                totalActualWeight: actualWeight * palletCount,
                chargeableWeight: getChargableWeight(),
                appliedRate: getApplicableRate(getChargableWeight()),
                totalCost: calculateTotalCost(),
                rateStructure: destinationRates[selectedDestination].rates,
                companyInfo,
                charges
              }}
            />
          </div>
          <div style={{ marginTop: '-35px', display: 'flex', justifyContent: 'center' }} className="print:hidden">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}