/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, X, File as FileIcon, ArrowUp } from 'lucide-react';
import { FileData } from '../types';
import { parseFile } from '../utils/fileParser';

interface FileUploadProps {
  onFilesSelected: (files: FileData[]) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isProcessing }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const validFiles: File[] = [];
    const maxFiles = 5;

    const fileArray = Array.from(files);

    if (fileArray.length + uploadedFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos.`);
      return;
    }

    validFiles.push(...fileArray);
    
    const newFilesList = [...uploadedFiles, ...validFiles];
    setUploadedFiles(newFilesList);

    try {
      const parsedPromises = newFilesList.map(f => parseFile(f));
      const results = await Promise.all(parsedPromises);
      onFilesSelected(results);
    } catch (err) {
      console.error(err);
      setError("Falha ao ler um ou mais arquivos. Verifique o formato.");
    }
  }, [uploadedFiles, onFilesSelected]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const newList = [...uploadedFiles];
    newList.splice(index, 1);
    setUploadedFiles(newList);
    Promise.all(newList.map(parseFile)).then(onFilesSelected);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`relative group w-full h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-300 ${
          dragActive 
            ? 'border-brand-500 bg-brand-50/50' 
            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        }`}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept=".csv,.xlsx,.xls,.json,.txt"
          disabled={isProcessing}
        />
        
        {/* Professional Button Design */}
        <div className="flex flex-col items-center pointer-events-none z-0 transform transition-transform duration-300 group-hover:scale-105">
          <div className="flex items-center justify-between pl-8 pr-2 py-2 bg-gradient-to-r from-orange-400 to-red-600 rounded-full shadow-lg shadow-orange-500/30 min-w-[280px]">
            <span className="text-white font-bold tracking-widest text-sm uppercase mr-4">
              Carregar Arquivo
            </span>
            <div className="bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center border border-white/30">
               <ArrowUp className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          </div>
          
          <p className="mt-6 text-xs font-medium text-gray-400 uppercase tracking-wide">
            Ou arraste seus arquivos aqui
          </p>
          <p className="text-[10px] text-gray-300 mt-1">
            CSV, Excel, JSON, TXT
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-center justify-center animate-fade-in">
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-6 grid gap-3 animate-fade-in">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Arquivos Selecionados</h4>
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-brand-200 transition-colors">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  {file.name.includes('xls') ? (
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  ) : (
                    <FileIcon className="w-6 h-6 text-brand-600" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <button
                onClick={() => removeFile(idx)}
                disabled={isProcessing}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};