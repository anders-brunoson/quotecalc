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
    discount
  } = state;

  // Ensure that roles include the alias field
  const rolesWithAlias = roles.map(role => ({
    id: role.id,
    name: role.name,
    code: role.code,
    alias: role.alias || '' // Include alias, defaulting to an empty string if not set
  }));

  const exportData = {
    chunks,
    roles: rolesWithAlias, // Use the updated roles array
    commitments,
    hourlyRates,
    hourlyCosts,
    workingDays,
    workingHours,
    rateCardName,
    predefinedRoles,
    chunkOrder,
    discount
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
    const missingKeys = requiredKeys.filter(key => !(key in importedData));
    
    if (missingKeys.length > 0) {
      throw new Error(`Invalid JSON structure. Missing keys: ${missingKeys.join(', ')}`);
    }

    // Ensure that imported roles have the alias field
    const rolesWithAlias = importedData.roles.map(role => ({
      ...role,
      alias: role.alias || '' // Ensure alias exists, defaulting to an empty string if not present
    }));

    return {
      ...importedData,
      roles: rolesWithAlias // Replace the roles array with the updated one
    };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw error;
  }
};