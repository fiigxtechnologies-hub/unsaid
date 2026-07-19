import { z } from "zod";

const trimmedText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const scenarioSchema = z
  .object({
    counterpart: trimmedText(2, 100),
    topic: trimmedText(10, 400),
    desiredOutcome: trimmedText(10, 400),
    fearedReaction: trimmedText(10, 400),
    additionalContext: z.string().trim().max(800).optional(),
  })
  .strict();

export const scenarioRequestSchema = z
  .object({
    scenario: scenarioSchema,
  })
  .strict();
