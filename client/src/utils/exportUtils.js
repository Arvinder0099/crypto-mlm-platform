/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the CSV file
 * @param {Array} headers - Optional custom headers
 */
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = csvHeaders.join(',') + '\n';
  
  data.forEach(row => {
    const values = csvHeaders.map(header => {
      let value = row[header];
      
      // Handle nested objects (e.g., user.name)
      if (header.includes('.')) {
        const keys = header.split('.');
        value = keys.reduce((obj, key) => obj?.[key], row);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle dates
      if (value instanceof Date) {
        value = value.toISOString();
      }
      
      // Handle objects/arrays
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }
      
      return value;
    });
    
    csvContent += values.join(',') + '\n';
  });
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export table to Excel-compatible CSV
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 */
export const exportToExcel = (data, filename) => {
  const timestamp = new Date().toISOString().split('T')[0];
  exportToCSV(data, `${filename}_${timestamp}.csv`);
};

/**
 * Print current page
 */
export const printPage = () => {
  window.print();
};
