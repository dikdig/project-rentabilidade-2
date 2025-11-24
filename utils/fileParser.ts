import * as XLSX from 'xlsx';
import { FileData } from '../types';

export const parseFile = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let parsedContent = '';

        // Simple heuristics for file types
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // Convert to CSV to save tokens and make it readable for AI
          parsedContent = XLSX.utils.sheet_to_csv(worksheet);
        } else if (file.name.endsWith('.json')) {
          // Minimize JSON whitespace
          parsedContent = JSON.stringify(JSON.parse(data as string));
        } else {
          // Assume TXT, CSV, SQL Dump text
          parsedContent = data as string;
        }

        // Truncate if excessively large (Safety mechanism for token limits)
        // Roughly 200k characters is safe for Gemini Flash 2.0 context window
        // but we keep it a bit tighter for response room.
        const MAX_CHARS = 250000;
        if (parsedContent.length > MAX_CHARS) {
          console.warn(`File ${file.name} truncated from ${parsedContent.length} to ${MAX_CHARS} chars.`);
          parsedContent = parsedContent.substring(0, MAX_CHARS) + "\n...[TRUNCATED]";
        }

        resolve({
          name: file.name,
          type: file.type,
          content: parsedContent,
          size: file.size,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  });
};
