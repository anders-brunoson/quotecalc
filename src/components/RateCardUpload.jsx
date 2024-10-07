import React from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const RateCardUpload = ({ onRateCardUploaded }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const processedData = processRateCardData(results.data);
          onRateCardUploaded(processedData);
        },
      });
    }
  };

  const processRateCardData = (data) => {
    const validData = data.filter(row => row.RoleName && row.RoleTier);
    
    const roles = validData.map((row, index) => ({
      id: row.RoleCode || (index + 1).toString(),
      name: row.RoleName,
      type: row.RoleTier,
      hourlyRate: parseInt(row.HourlyRate, 10),
      hourlyCost: parseInt(row.HourlyCost, 10),
    }));

    const hourlyCosts = {
      Junior: 0,
      Medior: 0,
      Senior: 0,
    };

    validData.forEach(row => {
      if (hourlyCosts[row.RoleTier] === 0) {
        hourlyCosts[row.RoleTier] = parseInt(row.HourlyCost, 10);
      }
    });

    return { roles, hourlyCosts };
  };

  return (
    <Button className="flex items-center" onClick={() => document.getElementById('rateCardUpload').click()}>
      <Upload className="mr-2 h-4 w-4" />
      Upload Rate Card
      <input
        id="rateCardUpload"
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </Button>
  );
};

export default RateCardUpload;