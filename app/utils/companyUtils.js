export const filterCompaniesWithInvoices = (allCompanies, allInvoices) => {
  if (!allCompanies || !allInvoices) return [];
  
  const companyIdsWithInvoices = new Set(
    allInvoices
      .filter(invoice => invoice.company?.id)
      .map(invoice => invoice.company.id)
  );
  
  const excludedIdentifiers = new Set([
    'ConnectWise', 
    'XYZTestCompany', 
    'XYZ', 
    'XYZ Test Company', 
    'CompassGRC'
  ]);
  
  return allCompanies
    .filter(company => 
      companyIdsWithInvoices.has(company.id) &&
      company.status?.name !== 'Inactive' && 
      company.status?.name !== 'Not-Approved' && 
      !excludedIdentifiers.has(company.identifier)
    )
    .sort((a, b) => a.name.localeCompare(b.name));
};