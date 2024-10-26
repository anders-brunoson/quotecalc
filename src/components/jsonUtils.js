// jsonUtils.js

export const exportStateToJSON = (state) => {
  const {
    simulationName,
    simulationDescription,
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
    discount,
    roleDiscounts    // Add roleDiscounts to export
  } = state;

  // Ensure that roles include the alias field
  const rolesWithAlias = roles.map(role => ({
    id: role.id,
    name: role.name,
    code: role.code,
    alias: role.alias || '' // Include alias, defaulting to an empty string if not set
  }));

  const exportData = {
    simulationName,
    simulationDescription,
    chunks,
    roles: rolesWithAlias,
    commitments,
    hourlyRates,
    hourlyCosts,
    workingDays,
    workingHours,
    rateCardName,
    predefinedRoles,
    chunkOrder,
    discount,
    roleDiscounts: roleDiscounts || {}  // Include roleDiscounts with default empty object
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
      'chunkOrder', 'discount'
    ];
    
    // Check for required keys
    const missingKeys = requiredKeys.filter(key => !(key in importedData));
    if (missingKeys.length > 0) {
      throw new Error(`Invalid JSON structure. Missing keys: ${missingKeys.join(', ')}`);
    }

    // Ensure that imported roles have the alias field
    const rolesWithAlias = importedData.roles.map(role => ({
      ...role,
      alias: role.alias || '' // Ensure alias exists, defaulting to an empty string if not present
    }));

    // Handle the roleDiscounts field, providing empty object as default if not present
    const roleDiscounts = importedData.roleDiscounts || {};

    return {
      simulationName: importedData.simulationName || '',
      simulationDescription: importedData.simulationDescription || '',
      ...importedData,
      roles: rolesWithAlias,
      roleDiscounts  // Include roleDiscounts in the returned data
    };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw error;
  }
};