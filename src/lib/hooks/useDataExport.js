import { useState, useCallback } from 'react';

const useDataExport = (options = {}) => {
  const {
    data = [],
    fileName = 'export',
    onExportStart = null,
    onExportComplete = null,
    onExportError = null,
    onImportStart = null,
    onImportComplete = null,
    onImportError = null,
    transformData = null,
    validateData = null,
  } = options;

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  // Export data to file
  const exportData = useCallback(
    async (format = 'json') => {
      try {
        setIsExporting(true);
        setError(null);

        if (onExportStart) {
          onExportStart();
        }

        let exportContent;
        let mimeType;
        let fileExtension;

        // Transform data if needed
        const transformedData = transformData ? transformData(data) : data;

        switch (format.toLowerCase()) {
          case 'json':
            exportContent = JSON.stringify(transformedData, null, 2);
            mimeType = 'application/json';
            fileExtension = 'json';
            break;

          case 'csv':
            exportContent = convertToCSV(transformedData);
            mimeType = 'text/csv';
            fileExtension = 'csv';
            break;

          case 'excel':
            exportContent = convertToExcel(transformedData);
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            fileExtension = 'xlsx';
            break;

          case 'pdf':
            exportContent = convertToPDF(transformedData);
            mimeType = 'application/pdf';
            fileExtension = 'pdf';
            break;

          default:
            throw new Error(`Unsupported export format: ${format}`);
        }

        // Create and trigger download
        const blob = new Blob([exportContent], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        if (onExportComplete) {
          onExportComplete();
        }
      } catch (err) {
        setError(err);
        if (onExportError) {
          onExportError(err);
        }
      } finally {
        setIsExporting(false);
      }
    },
    [data, fileName, transformData, onExportStart, onExportComplete, onExportError]
  );

  // Import data from file
  const importData = useCallback(
    async (file) => {
      try {
        setIsImporting(true);
        setError(null);

        if (onImportStart) {
          onImportStart();
        }

        const fileContent = await readFile(file);
        let importedData;

        // Parse file content based on file type
        switch (file.type) {
          case 'application/json':
            importedData = JSON.parse(fileContent);
            break;

          case 'text/csv':
            importedData = parseCSV(fileContent);
            break;

          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            importedData = parseExcel(fileContent);
            break;

          case 'application/pdf':
            importedData = parsePDF(fileContent);
            break;

          default:
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        // Validate imported data if validation function is provided
        if (validateData) {
          const validationResult = validateData(importedData);
          if (!validationResult.isValid) {
            throw new Error(validationResult.error);
          }
        }

        if (onImportComplete) {
          onImportComplete(importedData);
        }

        return importedData;
      } catch (err) {
        setError(err);
        if (onImportError) {
          onImportError(err);
        }
        throw err;
      } finally {
        setIsImporting(false);
      }
    },
    [validateData, onImportStart, onImportComplete, onImportError]
  );

  // Convert data to CSV format
  const convertToCSV = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers.map((header) => {
        const value = item[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      })
    );

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }, []);

  // Convert data to Excel format
  const convertToExcel = useCallback((data) => {
    // Implement Excel conversion logic here
    // You might want to use a library like xlsx
    throw new Error('Excel conversion not implemented');
  }, []);

  // Convert data to PDF format
  const convertToPDF = useCallback((data) => {
    // Implement PDF conversion logic here
    // You might want to use a library like jsPDF
    throw new Error('PDF conversion not implemented');
  }, []);

  // Read file content
  const readFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }, []);

  // Parse CSV content
  const parseCSV = useCallback((content) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map((header) => header.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',').map((value) => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
  }, []);

  // Parse Excel content
  const parseExcel = useCallback((content) => {
    // Implement Excel parsing logic here
    // You might want to use a library like xlsx
    throw new Error('Excel parsing not implemented');
  }, []);

  // Parse PDF content
  const parsePDF = useCallback((content) => {
    // Implement PDF parsing logic here
    // You might want to use a library like pdf.js
    throw new Error('PDF parsing not implemented');
  }, []);

  return {
    exportData,
    importData,
    isExporting,
    isImporting,
    error,
  };
};

export default useDataExport; 