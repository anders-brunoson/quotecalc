import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const CSVUpload = ({ onDataUploaded }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const { data } = results;
        const processedData = processCSVData(data);
        onDataUploaded(processedData);
      },
    });
  }, [onDataUploaded]);

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop, 
    accept: '.csv',
    noClick: true,
    noKeyboard: true
  });

  const processCSVData = (data) => {
    const validData = data.filter(row => row.chunk && row.role);

    const chunks = [...new Set(validData.map(row => row.chunk))];
    const roleNames = [...new Set(validData.map(row => row.role))];
    const roles = roleNames.map((name, index) => ({ 
      id: (index + 1).toString(), 
      name,
      type: validData.find(row => row.role === name)?.roleType || 'Senior'
    }));
    
    const commitments = {};
    const hourlyRates = {};
    const workingHours = {};
    const workingDays = {};
    const hourlyCosts = {
      Junior: 0,
      Medior: 0,
      Senior: 0
    };

    roles.forEach(role => {
      commitments[role.id] = {};
      hourlyRates[role.id] = {};
      workingHours[role.id] = 0;
    });

    validData.forEach(row => {
      const roleId = roles.find(r => r.name === row.role).id;
      commitments[roleId][row.chunk] = parseInt(row.commitmentLevel);
      hourlyRates[roleId][row.chunk] = parseInt(row.hourlyRate);
      workingHours[roleId] = parseFloat(row.workingHoursPerDay);
      workingDays[row.chunk] = parseInt(row.workingDays);
      
      // Update hourlyCosts if not already set
      if (hourlyCosts[row.roleType] === 0) {
        hourlyCosts[row.roleType] = parseInt(row.hourlyCost);
      }
    });

    return { chunks, roles, commitments, hourlyRates, workingHours, workingDays, hourlyCosts };
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button className="flex items-center" onClick={() => document.querySelector('input[type="file"]').click()}>
        <Upload className="mr-2 h-4 w-4" />
        Upload CSV
      </Button>
    </div>
  );
};

export default CSVUpload;