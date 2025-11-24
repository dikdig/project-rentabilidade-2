import { GoogleGenAI, Type, Schema, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { FileData, AnalysisResult, ChartConfig } from "../types";

// Define the output schema to ensure strict JSON structure
// Note: We use a structured format for chart data (series + values) because 
// the API does not support 'empty' object properties for dynamic keys in strict mode.
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A comprehensive executive summary of the financial findings and correlations.",
    },
    kpis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
          trend: { type: Type.NUMBER, description: "Percentage change if applicable" },
          trendDirection: { type: Type.STRING, enum: ["up", "down", "neutral"] },
          description: { type: Type.STRING },
        },
        required: ["label", "value", "trendDirection"],
      },
    },
    relationshipsFound: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of correlations found between files (e.g., 'Matched CustomerID in Sales.csv with ID in Users.json')",
    },
    fieldDescriptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          fieldName: { type: Type.STRING },
          sourceFile: { type: Type.STRING },
          meaning: { type: Type.STRING },
        },
        required: ["fieldName", "sourceFile", "meaning"],
      },
    },
    charts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["bar", "line", "pie", "area"] },
          description: { type: Type.STRING },
          series: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Names of the data series (e.g. ['Revenue', 'Cost']). These will be the keys in the chart."
          },
          data_points: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "The X-axis label (e.g. Month name, Category)" },
                values: { 
                  type: Type.ARRAY, 
                  items: { type: Type.NUMBER },
                  description: "Numeric values corresponding to the 'series' array order."
                }
              },
              required: ["label", "values"]
            }
          }
        },
        required: ["title", "type", "description", "series", "data_points"],
      },
    },
  },
  required: ["summary", "kpis", "charts", "fieldDescriptions", "relationshipsFound"],
};

export const analyzeFiles = async (files: FileData[]): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct the prompt context
  let fileContext = "";
  files.forEach((f, index) => {
    fileContext += `\n--- FILE ${index + 1}: ${f.name} ---\n${f.content}\n`;
  });

  const prompt = `
    You are an expert Senior Financial Data Analyst and Power BI Specialist.
    
    Your task is to analyze the provided raw data files. 
    These files may contain CSV, JSON, or Text dumps from databases.
    
    1. **Correlate Data:** specificially look for common identifiers (IDs, Emails, Dates, Transaction Codes) to join the data mentally.
    2. **Financial Analysis:** Calculate key metrics like Total Revenue, Net Profit, Margins, Growth Rates, Cost breakdowns.
    3. **Identify Trends:** Look for time-based patterns.
    4. **Describe Metadata:** Explain what the fields mean based on their content.
    
    Here is the raw data:
    ${fileContext}
    
    Generate a JSON response matching the schema provided. 
    IMPORTANT: Write the 'summary', 'meaning', 'description' and 'relationshipsFound' fields in Portuguese (pt-BR).
    
    For the 'charts' section:
    - 'series': List the names of the metrics you are plotting (e.g. ["Revenue", "Expenses"]).
    - 'data_points': For each point on the X-axis (label), provide the corresponding values for each series in the 'values' array.
    
    Prioritize:
    - Monthly Revenue/Profit trends (Line/Area)
    - Category breakdowns (Pie/Bar)
    - Top performers (Bar)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      },
    });

    if (!response.text) {
      const candidate = response.candidates?.[0];
      console.warn("Gemini response missing text. Candidate:", candidate);
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("A análise foi bloqueada pelos filtros de segurança. Tente remover dados sensíveis (PII) ou conteúdo explícito.");
      }
      throw new Error("A IA não retornou uma resposta válida. Tente novamente ou verifique os arquivos.");
    }

    const rawResult = JSON.parse(response.text);

    // Transform the AI's structured response into the flat structure needed for Recharts
    const formattedCharts: ChartConfig[] = rawResult.charts.map((chart: any, index: number) => {
      const dataKeys = chart.series;
      
      // Transform data_points [{label: "Jan", values: [100, 20]}] 
      // into [{name: "Jan", "Revenue": 100, "Expenses": 20}]
      const flatData = chart.data_points.map((dp: any) => {
        const dataPoint: any = { name: dp.label };
        dataKeys.forEach((key: string, idx: number) => {
          dataPoint[key] = dp.values[idx] || 0;
        });
        return dataPoint;
      });

      return {
        id: `chart-${index}`,
        title: chart.title,
        type: chart.type,
        description: chart.description,
        xAxisKey: "name",
        dataKeys: dataKeys,
        data: flatData
      };
    });

    return {
      summary: rawResult.summary,
      kpis: rawResult.kpis,
      relationshipsFound: rawResult.relationshipsFound,
      fieldDescriptions: rawResult.fieldDescriptions,
      charts: formattedCharts
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};