// jsonUtils.js

export const exportStateToJSON = (state) => {
  const {
    chunks,
    roles,
    commitments,
    hourlyRates,
    hourlyCosts,
    workingDays,
    workingHours,
    rateCardName,
    predefinedRoles,
    chunkOrder,
    discount  // Add discount to the exported state
  } = state;

  const exportData = {
    chunks,
    roles,
    commitments,
    hourlyRates,
    hourlyCosts,
    workingDays,
    workingHours,
    rateCardName,
    predefinedRoles,
    chunkOrder,
    discount  // Include discount in the exported data
  };

  return JSON.stringify(exportData, null, 2);
};

export const importStateFromJSON = (jsonString) => {
  try {
    const importedData = JSON.parse(jsonString);
    
    // Validate the imported data structure
    const requiredKeys = [
      'chunks', 'roles', 'commitments', 'hourlyRates', 'hourlyCosts', 
      'workingDays', 'workingHours', 'rateCardName', 'predefinedRoles', 
      'chunkOrder', 'discount'  // Add discount to the required keys
    ];
    const missingKeys = requiredKeys.filter(key => !(key in importedData));
    
    if (missingKeys.length > 0) {
      throw new Error(`Invalid JSON structure. Missing keys: ${missingKeys.join(', ')}`);
    }

    return importedData;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw error;
  }
};