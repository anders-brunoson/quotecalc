import React, { useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const RateCardCSVUpload = ({ onRateCardUploaded }) => {
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("RateCardCSVUpload component loaded");
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    console.log("File selected:", file.name);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log("CSV parsing complete:", results);
        const { data } = results;
        const processedData = processRateCardCSV(data);
        console.log("Processed rate card data:", processedData);
        onRateCardUploaded(processedData);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      }
    });
  };

  const processRateCardCSV = (data) => {
    console.log("Processing CSV data:", data);
    // Filter out any rows with empty fields
    const validData = data.filter(row => 
      row.RatecardName && row.RoleName && row.HourlyRate && row.HourlyCost && row.RoleCode
    );

    const rateCardName = validData[0]?.RatecardName || "Unknown Rate Card";
    const roles = validData.map(row => ({
      RoleName: row.RoleName,
      HourlyRate: row.HourlyRate,
      HourlyCost: row.HourlyCost,
      RoleCode: row.RoleCode
    }));

    return { rateCardName, roles };
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        style={{ display: 'none' }}
      />
      <Button 
        className="flex items-center" 
        onClick={() => fileInputRef.current.click()}
        variant="outline"
      >
        <Upload className="mr-2 h-3 w-3" />
        Upload Rate Card CSV
      </Button>
    </>
  );
};

export default RateCardCSVUpload;