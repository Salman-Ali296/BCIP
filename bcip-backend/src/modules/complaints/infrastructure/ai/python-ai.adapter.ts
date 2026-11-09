// src/modules/complaints/infrastructure/ai/python-ai.adapter.ts
import axios from 'axios';
import { IAnalyticsPort, AiInsightsResult } from '../../application/ports/ai-analytics.port';
import { CircuitBreaker } from '../../../../utils/circuitBreaker';

export class PythonAiAdapter implements IAnalyticsPort {
    private circuitBreaker: CircuitBreaker<any>;

    constructor(private readonly pythonBaseUrl: string) {
        // Wrap the HTTP call in a Circuit Breaker to prevent cascading failures
        this.circuitBreaker = new CircuitBreaker('PythonAiAdapter', {
            timeout: 5000,
            failureThreshold: 5,
            resetTimeout: 30000,
        });
    }

    async analyzeComplaint(text: string): Promise<AiInsightsResult> {
        // The ACL translates TS domain data to Python's expected payload
        const payload = { text: text, locale: 'en_PK' };

        // Execute through circuit breaker
        const pythonResponse = await this.circuitBreaker.execute(() => this.callPythonApi(payload));

        // The ACL translates Python's response back to TS Application DTOs
        return this.mapPythonResponseToDto(pythonResponse);
    }

    private async callPythonApi(payload: any): Promise<any> {
        const response = await axios.post(`${this.pythonBaseUrl}/api/v1/analyze`, payload);
        return response.data;
    }

    private mapPythonResponseToDto(data: any): AiInsightsResult {
        // Anti-Corruption: We don't trust Python's schema implicitly. We map it strictly.
        const sentimentScore = Math.max(-1, Math.min(1, Number(data.sentiment_score) || 0));
        const sentimentLabel = data.sentiment_label === 'POSITIVE' || data.sentiment_label === 'NEGATIVE'
            ? data.sentiment_label
            : 'NEUTRAL';

        return {
            category: data.category || 'GENERAL',
            priority: Math.max(0, Math.min(100, Number(data.priority_score) || 50)),
            sentimentScore,
            sentimentLabel,
            isDuplicate: data.is_duplicate === true,
            duplicateOf: typeof data.duplicate_of === 'string' ? data.duplicate_of : null,
            duplicateSimilarity: typeof data.duplicate_similarity === 'number'
                ? Math.max(0, Math.min(1, data.duplicate_similarity))
                : null,
        };
    }
}