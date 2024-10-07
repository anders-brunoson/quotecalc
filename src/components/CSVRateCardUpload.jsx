import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const CSVRateCardUpload = ({ onRateCardUploaded }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      header: true,
      delimiter: ";",
      complete: (results) => {
        const { data } = results;
        const processedData = processRateCardData(data);
        onRateCardUploaded(processedData);
      },
    });
  }, [onRateCardUploaded]);

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: '.csv',
    noClick: true,
    noKeyboard: true
  });

  const processRateCardData = (data) => {
    const rateCards = {};

    data.forEach(row => {
      if (!rateCards[row.RatecardName]) {
        rateCards[row.RatecardName] = [];
      }

      rateCards[row.RatecardName].push({
        name: row.RoleName,
        hourlyRate: parseInt(row.HourlyRate),
        hourlyCost: parseInt(row.HourlyCost),
        roleCode: row.RoleCode
      });
    });

    return rateCards;
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button className="flex items-center" onClick={() => document.querySelector('input[type="file"]').click()}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Rate Card CSV
      </Button>
    </div>
  );
};

export default CSVRateCardUpload;