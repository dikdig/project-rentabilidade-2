/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { FileData, AnalysisResult, AppStatus } from './types';
import { analyzeFiles } from './services/geminiService';
import { Loader2, Sparkles, Trash2, PieChart, ShieldCheck, Zap, TrendingUp, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

// Attach XLSX to window for global usage in parsing
(window as any).XLSX = XLSX;

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [files, setFiles] = useState<FileData[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: FileData[]) => {
    setFiles(selectedFiles);
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setStatus(AppStatus.ANALYZING);
    setError(null);

    try {
      const data = await analyzeFiles(files);
      setResult(data);
      setStatus(AppStatus.COMPLETE);
    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro durante a análise. Verifique sua chave API ou tente com arquivos menores.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow w-full">
        
        {status === AppStatus.IDLE || status === AppStatus.ERROR ? (
          <>
            {/* Bank-style Red Hero Section */}
            <div className="bg-brand-700 pb-32 pt-10 px-4 sm:px-6 lg:px-8 shadow-md">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Olá, Analista
                </h2>
                <p className="text-brand-100 text-lg max-w-2xl">
                  Centralize suas finanças. Carregue seus arquivos <FileText className="inline-block w-5 h-5 mb-1" /> e deixe nossa IA organizar seus números.
                </p>
              </div>
            </div>

            {/* Overlapping Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-12">
              
              {/* Main Action Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                  
                  <FileUpload onFilesSelected={handleFilesSelected} isProcessing={false} />
                  
                  {files.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-end items-center pt-8 gap-4 border-t border-gray-100 mt-8">
                      <button
                        onClick={handleReset}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-gray-600 transition-all duration-200 bg-gray-50 border border-transparent rounded-lg hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Limpar
                      </button>

                      <button
                        onClick={handleAnalyze}
                        className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white transition-all duration-200 bg-brand-600 rounded-lg hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </button>
                    </div>
                  )}
                </div>
                
                {status === AppStatus.ERROR && (
                   <div className="bg-red-50 border-t border-red-100 p-4 text-red-700 text-center text-sm font-medium">
                     {error}
                   </div>
                )}
              </div>

              {/* Quick Features Grid (Bank App Style) */}
              {files.length === 0 && (
                <div>
                   <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">Vantagens Exclusivas</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FeatureCard 
                       icon={<Zap size={24} className="text-brand-600"/>}
                       title="Análise Relâmpago"
                       desc="Processamento instantâneo de múltiplos formatos de arquivo."
                     />
                     <FeatureCard 
                       icon={<PieChart size={24} className="text-brand-600"/>}
                       title="Visão 360º"
                       desc="Gráficos e KPIs gerados automaticamente pela IA."
                     />
                     <FeatureCard 
                       icon={<ShieldCheck size={24} className="text-brand-600"/>}
                       title="Segurança Total"
                       desc="Seus dados são processados em ambiente seguro."
                     />
                   </div>
                </div>
              )}
            </div>
          </>
        ) : status === AppStatus.ANALYZING ? (
          <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-brand-100 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white p-8 rounded-full shadow-2xl border border-gray-100">
                <Loader2 className="h-16 w-16 text-brand-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Processando transações...</h3>
            <p className="text-gray-500 max-w-md text-center px-4">
              Nossa inteligência artificial está cruzando as informações dos seus {files.length} arquivos importados.
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {result && <Dashboard result={result} files={files} onReset={handleReset} />}
          </div>
        )}
      </main>
    </div>
  );
};

const FeatureCard: React.FC<{title: string, desc: string, icon: React.ReactNode}> = ({title, desc, icon}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
    <div className="bg-brand-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
  </div>
)

export default App;