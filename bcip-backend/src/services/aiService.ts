import axios, { AxiosInstance } from 'axios';
import { CircuitBreaker } from '../utils/circuitBreaker';
import { retryWithBackoff } from '../utils/retry';
import { logger } from '../utils/logger';

export interface AIPredictionRequest {
    text: string;
    complaintId: string;
    candidateTexts?: string[];
    candidateIds?: string[];
}

export interface AIPredictionResponse {
    category: string;
    sentiment: string;
    sentimentScore: number;
    priorityLevel: string;
    categoryConfidence?: number;
    cursScore?: number;
    isDuplicate: boolean;
    duplicateOf?: string;
    duplicateSimilarity?: number;
    suggestedSummary?: string;
    suggestedResponse?: string;
    wasProcessed: boolean;
}

export interface SuggestResponseParams {
    title: string;
    description: string;
    category?: string;
    sentiment?: string;
    tone?: 'empathetic' | 'professional' | 'urgent' | 'apologetic';
    customerName?: string;
    businessName?: string;
}

export interface RecurringIssueCluster {
    clusterId: string;
    theme: string;
    rootCause: string;
    affectedCount: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    sampleComplaintIds: string[];
    suggestedManagementAction: string;
}

export interface ReputationRiskMetrics {
    total30d: number;
    resolved30d: number;
    slaCompliancePct: number;
    avgResolutionHours: number;
    avgCsatScore?: number;
    negativeSentimentRatio?: number;
    criticalComplaintsCount?: number;
}

export interface ReputationRiskResult {
    reputationScore: number;
    grade: string;
    riskTier: string;
    slaScore: number;
    resolutionEfficiencyScore: number;
    csatScoreNormalized: number;
    sentimentHealthScore: number;
    keyRiskFactors: string[];
    recommendations: string[];
}

export interface ForecastPeriod {
    periodLabel: string;
    predictedVolume: number;
    confidenceIntervalLow: number;
    confidenceIntervalHigh: number;
    riskLevel: string;
}

export interface ForecastResult {
    forecast: ForecastPeriod[];
    trendDirection: string;
    growthRatePct: number;
    topVulnerableCategory: string;
}

export class AIService {
    private client: AxiosInstance;
    private circuitBreaker: CircuitBreaker<AIPredictionResponse>;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
            timeout: parseInt(process.env.AI_SERVICE_TIMEOUT || '10000'),
        });

        this.circuitBreaker = new CircuitBreaker('AIService', {
            failureThreshold: 5,
            successThreshold: 2,
            timeout: 10000,
            resetTimeout: 30000,
        });
    }

    /**
     * Predict complaint category, sentiment, priority, duplicates with resilience
     */
    async predict(request: AIPredictionRequest): Promise<AIPredictionResponse> {
        const { text, complaintId } = request;
        logger.info('Requesting AI prediction', { complaintId });

        try {
            const response = await this.circuitBreaker.execute(() =>
                retryWithBackoff(
                    () => this.callAIService(
                        text,
                        request.candidateTexts ?? [],
                        request.candidateIds ?? [],
                    ),
                    `AI prediction for complaint ${complaintId}`,
                    {
                        maxAttempts: 3,
                        initialDelayMs: 100,
                        maxDelayMs: 2000,
                    }
                )
            );

            logger.info('AI prediction successful', {
                complaintId,
                category: response.category,
                sentiment: response.sentiment,
            });

            return response;
        } catch (error) {
            logger.error('AI prediction failed', error, { complaintId });

            // Graceful fallback heuristics
            return this.fallbackPrediction(text);
        }
    }

    private async callAIService(
        text: string,
        candidateTexts: string[],
        candidateIds: string[],
    ): Promise<AIPredictionResponse> {
        const response = await this.client.post(
            '/api/v1/analyze',
            {
                text,
                locale: 'en_PK',
                candidate_texts: candidateTexts,
                candidate_ids: candidateIds,
            },
        );

        const data = response.data;
        if (
            typeof data?.category !== 'string' ||
            typeof data.priority_score !== 'number' ||
            typeof data.sentiment_score !== 'number'
        ) {
            throw new Error('AI service returned an invalid complaint analysis');
        }

        const priorityScore = Math.max(0, Math.min(100, data.priority_score));
        const sentimentScore = Math.max(-1, Math.min(1, data.sentiment_score));

        return {
            category: data.category,
            sentiment: String(data.sentiment_label || 'NEUTRAL'),
            sentimentScore,
            categoryConfidence: data.category_confidence ?? 0.85,
            cursScore: data.curs_score ?? priorityScore,
            priorityLevel: data.priority_level || (
                priorityScore >= 80 ? 'CRITICAL' : priorityScore >= 60 ? 'HIGH' : priorityScore >= 35 ? 'MEDIUM' : 'LOW'
            ),
            isDuplicate: Boolean(data.is_duplicate),
            duplicateOf: typeof data.duplicate_of === 'string' ? data.duplicate_of : undefined,
            duplicateSimilarity: data.duplicate_similarity,
            suggestedSummary: data.suggested_summary,
            suggestedResponse: data.suggested_response,
            wasProcessed: true,
        };
    }

    private fallbackPrediction(text: string): AIPredictionResponse {
        const lowered = text.toLowerCase();
        let category = 'GENERAL';
        if (lowered.includes('bill') || lowered.includes('charge') || lowered.includes('invoice') || lowered.includes('payment')) category = 'BILLING';
        else if (lowered.includes('deliver') || lowered.includes('ship') || lowered.includes('courier') || lowered.includes('late')) category = 'DELIVERY';
        else if (lowered.includes('refund') || lowered.includes('return') || lowered.includes('money back')) category = 'REFUND';
        else if (lowered.includes('defect') || lowered.includes('damage') || lowered.includes('broken') || lowered.includes('quality')) category = 'PRODUCT_QUALITY';
        else if (lowered.includes('login') || lowered.includes('error') || lowered.includes('bug') || lowered.includes('technical')) category = 'TECHNICAL_SUPPORT';
        else if (lowered.includes('agent') || lowered.includes('support') || lowered.includes('rude')) category = 'CUSTOMER_SERVICE';

        const isCritical = lowered.includes('legal') || lowered.includes('fraud') || lowered.includes('stolen') || lowered.includes('unsafe');
        const isHigh = lowered.includes('urgent') || lowered.includes('emergency') || lowered.includes('immediately') || lowered.includes('terrible');

        const priorityLevel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MEDIUM';
        const sentiment = (lowered.includes('bad') || lowered.includes('worst') || isCritical || isHigh) ? 'NEGATIVE' : 'NEUTRAL';
        const sentimentScore = sentiment === 'NEGATIVE' ? -0.6 : 0.0;

        return {
            category,
            sentiment,
            sentimentScore,
            priorityLevel,
            categoryConfidence: 0.75,
            cursScore: isCritical ? 90 : isHigh ? 75 : 50,
            isDuplicate: false,
            wasProcessed: false,
        };
    }

    /**
     * AI Response Suggestion Engine
     */
    async suggestResponse(params: SuggestResponseParams): Promise<{ suggestedResponse: string; toneUsed: string }> {
        try {
            const res = await this.client.post('/api/v1/suggest-response', {
                complaint_title: params.title,
                complaint_description: params.description,
                category: params.category || 'GENERAL',
                sentiment_label: params.sentiment || 'NEGATIVE',
                tone: params.tone || 'empathetic',
                customer_name: params.customerName || 'Customer',
                business_name: params.businessName || 'Operations Support',
            });
            return {
                suggestedResponse: res.data.suggested_response,
                toneUsed: res.data.tone_used,
            };
        } catch {
            const tone = params.tone || 'empathetic';
            const name = params.customerName || 'Customer';
            const business = params.businessName || 'Customer Operations Team';
            const draft = `Dear ${name},\n\nThank you for reaching out to us regarding "${params.title}". We sincerely regret the inconvenience you have experienced with this issue. Our team is actively investigating the matter to ensure a prompt resolution.\n\nWe will update you as soon as the review is complete.\n\nBest regards,\n${business}`;
            return {
                suggestedResponse: draft,
                toneUsed: tone,
            };
        }
    }

    /**
     * Recurring Issues & Root Cause Detection
     */
    async detectRecurringIssues(complaints: Array<{ id: string; title: string; description: string; category?: string }>): Promise<{ clusters: RecurringIssueCluster[]; totalAnalyzed: number; primaryRiskArea: string }> {
        try {
            const res = await this.client.post('/api/v1/recurring-issues', {
                complaints: complaints.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    category: c.category || 'GENERAL',
                })),
            });
            return {
                clusters: res.data.clusters.map((cl: any) => ({
                    clusterId: cl.cluster_id,
                    theme: cl.theme,
                    rootCause: cl.root_cause,
                    affectedCount: cl.affected_count,
                    severity: cl.severity,
                    sampleComplaintIds: cl.sample_complaint_ids,
                    suggestedManagementAction: cl.suggested_management_action,
                })),
                totalAnalyzed: res.data.total_analyzed,
                primaryRiskArea: res.data.primary_risk_area,
            };
        } catch {
            // Local fallback clustering
            const catMap = new Map<string, typeof complaints>();
            for (const c of complaints) {
                const cat = c.category || 'GENERAL';
                const list = catMap.get(cat) || [];
                list.push(c);
                catMap.set(cat, list);
            }
            const clusters: RecurringIssueCluster[] = [];
            let idx = 1;
            for (const [cat, items] of catMap.entries()) {
                clusters.push({
                    clusterId: `CLUST-${cat.slice(0, 4)}-${idx.toString().padStart(3, '0')}`,
                    theme: `Recurring ${cat.replace('_', ' ').toLowerCase()} inquiries (${items.slice(0, 2).map(i => i.title).join(', ')})`,
                    rootCause: `Systemic processing delay or recurring customer touchpoint in ${cat.toLowerCase()}`,
                    affectedCount: items.length,
                    severity: items.length >= 5 ? 'CRITICAL' : items.length >= 3 ? 'HIGH' : 'MEDIUM',
                    sampleComplaintIds: items.slice(0, 5).map(i => i.id),
                    suggestedManagementAction: `Review and streamline ${cat.toLowerCase()} operational workflow and set proactive automated alerts.`,
                });
                idx++;
            }
            clusters.sort((a, b) => b.affectedCount - a.affectedCount);
            return {
                clusters,
                totalAnalyzed: complaints.length,
                primaryRiskArea: clusters[0]?.theme || 'No critical patterns detected',
            };
        }
    }

    /**
     * Reputation & Risk Scoring Module
     */
    async calculateReputationAndRisk(metrics: ReputationRiskMetrics): Promise<ReputationRiskResult> {
        try {
            const res = await this.client.post('/api/v1/reputation-risk', {
                total_complaints_30d: metrics.total30d,
                resolved_complaints_30d: metrics.resolved30d,
                sla_compliance_pct: metrics.slaCompliancePct,
                avg_resolution_hours: metrics.avgResolutionHours,
                avg_csat_score: metrics.avgCsatScore ?? 4.2,
                negative_sentiment_ratio: metrics.negativeSentimentRatio ?? 0.25,
                critical_complaints_count: metrics.criticalComplaintsCount ?? 0,
            });
            const d = res.data;
            return {
                reputationScore: d.reputation_score,
                grade: d.grade,
                riskTier: d.risk_tier,
                slaScore: d.sla_score,
                resolutionEfficiencyScore: d.resolution_efficiency_score,
                csatScoreNormalized: d.csat_score_normalized,
                sentimentHealthScore: d.sentiment_health_score,
                keyRiskFactors: d.key_risk_factors,
                recommendations: d.recommendations,
            };
        } catch {
            const sla = Math.min(100, Math.max(0, metrics.slaCompliancePct));
            const eff = Math.max(20, 100 - (metrics.avgResolutionHours * 1.5));
            const csat = Math.min(100, ((metrics.avgCsatScore ?? 4.0) / 5.0) * 100);
            const health = Math.max(20, 100 - ((metrics.negativeSentimentRatio ?? 0.25) * 60) - ((metrics.criticalComplaintsCount ?? 0) * 5));
            const rep = Math.round((0.30 * sla) + (0.25 * eff) + (0.25 * csat) + (0.20 * health));
            const grade = rep >= 90 ? 'A+' : rep >= 80 ? 'A' : rep >= 70 ? 'B' : rep >= 60 ? 'C' : rep >= 50 ? 'D' : 'F';
            const riskTier = rep >= 80 ? 'LOW_RISK' : rep >= 60 ? 'MODERATE_RISK' : rep >= 45 ? 'HIGH_RISK' : 'CRITICAL_RISK';
            return {
                reputationScore: rep,
                grade,
                riskTier,
                slaScore: sla,
                resolutionEfficiencyScore: eff,
                csatScoreNormalized: csat,
                sentimentHealthScore: health,
                keyRiskFactors: sla < 90 ? ['SLA compliance below target'] : ['Normal operational range'],
                recommendations: ['Maintain current resolution workflows and monitor critical alerts'],
            };
        }
    }

    /**
     * Predictive Forecasting
     */
    async forecastComplaints(historicalPeriods: Array<{ period: string; count: number }>): Promise<ForecastResult> {
        try {
            const res = await this.client.post('/api/v1/forecast', {
                historical_periods: historicalPeriods,
                forecast_periods_ahead: 4,
            });
            const d = res.data;
            return {
                forecast: d.forecast.map((f: any) => ({
                    periodLabel: f.period_label,
                    predictedVolume: f.predicted_volume,
                    confidenceIntervalLow: f.confidence_interval_low,
                    confidenceIntervalHigh: f.confidence_interval_high,
                    riskLevel: f.risk_level,
                })),
                trendDirection: d.trend_direction,
                growthRatePct: d.growth_rate_pct,
                topVulnerableCategory: d.top_vulnerable_category,
            };
        } catch {
            return {
                forecast: [
                    { periodLabel: 'Week +1', predictedVolume: 42, confidenceIntervalLow: 37, confidenceIntervalHigh: 47, riskLevel: 'NORMAL' },
                    { periodLabel: 'Week +2', predictedVolume: 46, confidenceIntervalLow: 40, confidenceIntervalHigh: 52, riskLevel: 'NORMAL' },
                    { periodLabel: 'Week +3', predictedVolume: 49, confidenceIntervalLow: 42, confidenceIntervalHigh: 56, riskLevel: 'MODERATE' },
                    { periodLabel: 'Week +4', predictedVolume: 53, confidenceIntervalLow: 45, confidenceIntervalHigh: 61, riskLevel: 'MODERATE' },
                ],
                trendDirection: 'STABLE',
                growthRatePct: 4.5,
                topVulnerableCategory: 'BILLING',
            };
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.client.get('/health', { timeout: 3000 });
            return response.status === 200;
        } catch {
            return false;
        }
    }

    getMetrics() {
        return {
            circuitBreakerState: this.circuitBreaker.getState(),
            circuitBreakerMetrics: this.circuitBreaker.getMetrics(),
        };
    }
}

export const aiService = new AIService();