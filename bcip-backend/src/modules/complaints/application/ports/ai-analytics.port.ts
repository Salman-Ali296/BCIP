// src/modules/complaints/application/ports/ai-analytics.port.ts
export interface AiInsightsResult {
    category: string;
    priority: number; // 0-100
    sentimentScore: number; // -1.0 to 1.0
    sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    isDuplicate: boolean;
    duplicateOf: string | null;
    duplicateSimilarity: number | null;
}

export interface IAnalyticsPort {
    analyzeComplaint(text: string): Promise<AiInsightsResult>;
}