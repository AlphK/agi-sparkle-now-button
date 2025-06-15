
import { z } from 'zod';

export const AnalysisResultSchema = z.object({
  relevance: z.enum(['critical', 'high', 'medium', 'low']),
  agiProbability: z.number().min(0).max(100),
  reasoning: z.string(),
  keyInsights: z.array(z.string())
});

export const BatchAnalysisResultSchema = z.object({
  items: z.array(z.object({
    title: z.string(),
    analysis: AnalysisResultSchema
  })),
  overallAgiDetection: z.object({
    detected: z.boolean(),
    confidence: z.number().min(0).max(100),
    reasoning: z.string()
  })
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type BatchAnalysisResult = z.infer<typeof BatchAnalysisResultSchema>;
