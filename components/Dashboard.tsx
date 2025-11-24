/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { AnalysisResult, KPIMetric, ChartConfig, FileData } from '../types';
import { 
  ArrowUpRight, ArrowDownRight, Minus, Info, Link2, TableProperties, 
  Database, Search, ArrowUpDown, ChevronLeft, ChevronRight, FileText,
  Share2, Copy, Mail, Check
} from 'lucide-react';

interface DashboardProps {
  result: AnalysisResult;
  files: FileData[];
  onReset: () => void;
}

// Digital Bank Red Theme Colors
const COLORS = ['#dc2626', '#1e293b', '#94a3b8', '#b91c1c', '#f87171', '#475569', '#cbd5e1'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value}`;
};

const KPIItem: React.FC<{ item: KPIMetric }> = ({ item }) => {
  const getTrendColor = () => {
    if (item.trendDirection === 'up') return 'text-green-600 bg-green-50 border-green-100';
    if (item.trendDirection === 'down') return 'text-red-600 bg-red-50 border-red-100';
    return 'text-gray-600 bg-gray-50 border-gray-100';
  };

  const getTrendIcon = () => {
    if (item.trendDirection === 'up') return <ArrowUpRight size={14} strokeWidth={3} />;
    if (item.trendDirection === 'down') return <ArrowDownRight size={14} strokeWidth={3} />;
    return <Minus size={14} strokeWidth={3} />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-brand-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider relative z-10">{item.label}</p>
      <div className="mt-3 flex items-baseline justify-between relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{item.value}</h3>
        {item.trend !== undefined && (
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">{Math.abs(item.trend)}%</span>
          </div>
        )}
      </div>
      {item.description && <p className="mt-3 text-xs text-gray-400 leading-relaxed group-hover:text-gray-500 transition-colors relative z-10">{item.description}</p>}
    </div>
  );
};

const DynamicChart: React.FC<{ config: ChartConfig }> = ({ config }) => {
  // Determine if the chart represents financial data based on keywords in the title
  const isFinancial = useMemo(() => {
    const t = config.title.toLowerCase();
    return t.includes('receita') || 
           t.includes('faturamento') || 
           t.includes('lucro') || 
           t.includes('custo') || 
           t.includes('despesa') || 
           t.includes('valor') ||
           t.includes('venda');
  }, [config.title]);

  const axisFormatter = (val: number) => {
    if (isFinancial) return formatCompactCurrency(val);
    return val > 1000 ? `${val/1000}k` : String(val);
  };

  const tooltipFormatter = (val: number) => {
    if (isFinancial) return [formatCurrency(val), undefined];
    return [val, undefined];
  };

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <BarChart data={config.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey={config.xAxisKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={axisFormatter} />
            <Tooltip 
              formatter={(value: number) => isFinancial ? formatCurrency(value) : value}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#374151', fontSize: '12px', fontWeight: 600 }}
              cursor={{fill: '#fef2f2'}}
            />
            <Legend wrapperStyle={{paddingTop: '10px'}} />
            {config.dataKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[6, 6, 0, 0]} maxBarSize={50} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={config.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey={config.xAxisKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={axisFormatter} />
            <Tooltip 
               formatter={(value: number) => isFinancial ? formatCurrency(value) : value}
               contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{paddingTop: '10px'}} />
            {config.dataKeys.map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={config.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              {config.dataKeys.map((key, index) => (
                <linearGradient key={`grad-${key}`} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey={config.xAxisKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={axisFormatter} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
            <Tooltip 
               formatter={(value: number) => isFinancial ? formatCurrency(value) : value}
               contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{paddingTop: '10px'}} />
            {config.dataKeys.map((key, index) => (
              <Area key={key} type="monotone" dataKey={key} stroke={COLORS[index % COLORS.length]} fillOpacity={1} fill={`url(#color${key})`} />
            ))}
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey={config.dataKeys[0]}
              nameKey={config.xAxisKey}
            >
              {config.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value: number) => isFinancial ? formatCurrency(value) : value}
               contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-96 flex flex-col transition-all hover:shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{config.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() as any}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const RawDataViewer: React.FC<{ files: FileData[] }> = ({ files }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const itemsPerPage = 10;

  // Parse the currently selected file's content
  const parsedData = useMemo(() => {
    const file = files[activeFileIndex];
    if (!file || !file.content) return [];

    const content = file.content;

    // Try parsing as JSON first
    try {
      const json = JSON.parse(content);
      if (Array.isArray(json)) return json;
      if (typeof json === 'object') return [json]; // Wrap single object
    } catch (e) {
      // Fallback to CSV parsing
    }

    // CSV/Text Parsing
    const lines = content.split('\n').filter(line => line.trim() !== '' && !line.includes('[TRUNCATED]'));
    if (lines.length === 0) return [];

    // Detect Delimiter (looking at first line)
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    const headers = firstLine.split(separator).map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(separator);
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        let val = values[index]?.trim() || '';
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        row[header] = val;
      });
      return row;
    });

  }, [files, activeFileIndex]);

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm) return parsedData;
    const lowerTerm = searchTerm.toLowerCase();
    return parsedData.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(lowerTerm)
      );
    });
  }, [parsedData, searchTerm]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];

      // Basic comparison
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const columns = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col mt-8">
      {/* Header & Tabs */}
      <div className="border-b border-gray-200">
        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50 gap-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Database size={18} className="text-brand-600" />
            Extrato de Dados
          </h3>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none w-full md:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="flex overflow-x-auto px-4 gap-2 pt-2 scrollbar-hide">
          {files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveFileIndex(idx); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeFileIndex === idx
                  ? 'border-brand-600 text-brand-700 bg-brand-50/50 rounded-t-md'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={14} />
              {file.name}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col} 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors group select-none border-b border-gray-200"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col}
                    <ArrowUpDown size={12} className={`text-gray-400 ${sortConfig.key === col ? 'text-brand-600' : 'opacity-0 group-hover:opacity-100'}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.length > 0 ? (
              currentData.map((row, idx) => (
                <tr key={idx} className="hover:bg-brand-50/30 transition-colors">
                  {columns.map((col) => (
                    <td key={`${idx}-${col}`} className="px-6 py-3 whitespace-nowrap max-w-xs truncate" title={String(row[col])}>
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={24} className="text-gray-300" />
                    <p>Nenhum dado encontrado.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="text-xs md:text-sm text-gray-500">
          {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData.length)} - {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ result, files, onReset }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => {
        setLinkCopied(false);
        setIsShareOpen(false);
    }, 2000);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Análise Financeira - Analise de Rentabilidade Inteligente");
    const body = encodeURIComponent(`Confira este resumo executivo:\n\n${result.summary}\n\nGerado por Analise de Rentabilidade Inteligente.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareOpen(false);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Executive Summary - Digital Bank Style (Solid Red with White Text) */}
      <div className="bg-brand-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-brand-500 opacity-20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h2 className="text-sm font-bold mb-3 tracking-widest text-brand-200 uppercase">Resumo Executivo</h2>
              <p className="text-white text-xl md:text-2xl leading-relaxed font-medium">
                {result.summary}
              </p>
            </div>
            
            <div className="flex flex-shrink-0 items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  className="flex items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Compartilhar</span>
                </button>

                {isShareOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsShareOpen(false)}
                    ></div>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20 py-1 origin-top-right">
                      <button 
                        onClick={handleCopyLink}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        {linkCopied ? <Check size={16} className="text-green-600"/> : <Copy size={16} className="text-gray-400" />}
                        <span className={linkCopied ? "text-green-600 font-medium" : ""}>
                          {linkCopied ? 'Link Copiado!' : 'Copiar Link'}
                        </span>
                      </button>
                      <button 
                        onClick={handleShareEmail}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-50"
                      >
                        <Mail size={16} className="text-gray-400" />
                        Email
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={onReset}
                className="bg-white text-brand-700 hover:bg-gray-100 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all"
              >
                Nova Análise
              </button>
            </div>
          </div>
          
          {/* Relationships Badge */}
          <div className="mt-8 flex flex-wrap gap-3">
            {result.relationshipsFound.map((rel, idx) => (
              <div key={idx} className="flex items-center bg-black/20 px-3 py-1.5 rounded-full text-xs font-medium text-white border border-white/10">
                <Link2 size={12} className="mr-1.5" />
                {rel}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {result.kpis.map((kpi, idx) => (
          <KPIItem key={idx} item={kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {result.charts.map((chart, idx) => (
          <DynamicChart key={idx} config={chart} />
        ))}
      </div>

      {/* Raw Data Explorer */}
      {files && files.length > 0 && (
        <RawDataViewer files={files} />
      )}

      {/* Field Descriptions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TableProperties size={18} className="text-brand-600" />
            Glossário
          </h3>
          <span className="text-[10px] font-bold tracking-wider text-white bg-brand-600 px-2 py-1 rounded uppercase">IA</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3 w-1/4">Campo</th>
                <th className="px-6 py-3 w-1/4">Origem</th>
                <th className="px-6 py-3 w-1/2">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.fieldDescriptions.map((field, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{field.fieldName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">
                      {field.sourceFile}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 leading-relaxed flex items-start gap-2">
                    <Info size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                    {field.meaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};