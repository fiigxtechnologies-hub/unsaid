import { z } from "zod";

const identifierSchema = z.string().min(1).max(200);
const blueprintTextSchema = z.string().min(1).max(300);
const boundedBlueprintListSchema = z
  .array(blueprintTextSchema)
  .max(6);

const conversationPhaseSchema = z.enum([
  "opening",
  "exploration",
  "resistance",
  "negotiation",
  "resolution",
]);

const pressureLabelSchema = z.enum([
  "Receptive",
  "Guarded",
  "Defensive",
  "Escalating",
]);

const conversationStateSchema = z
  .object({
    receptivity: z.number().int().min(0).max(100),
    defensiveness: z.number().int().min(0).max(100),
    trust: z.number().int().min(0).max(100),
    askClarity: z.number().int().min(0).max(100),
    resolutionLikelihood: z.number().int().min(0).max(100),
  })
  .strict();

const canonicalMessageSchema = z
  .object({
    id: identifierSchema,
    role: z.enum(["user", "counterpart"]),
    content: z.string().min(1).max(1000),
    turnNumber: z.number().int().min(0).max(12),
    order: z.number().int().nonnegative(),
  })
  .strict();

const stateSnapshotSchema = z
  .object({
    afterMessageId: identifierSchema,
    state: conversationStateSchema,
    phase: conversationPhaseSchema,
  })
  .strict();

const privateBranchBase = {
  resultingState: conversationStateSchema,
  resultingPhase: conversationPhaseSchema,
  resultingPressureLabel: pressureLabelSchema,
};

const originalBranchPrivateSchema = z
  .object({
    turningPointTurnId: identifierSchema,
    precedingMessageId: identifierSchema,
    preTurnState: conversationStateSchema,
    preTurnPhase: conversationPhaseSchema,
    originalUserMessage: canonicalMessageSchema,
    originalCounterpartMessage: canonicalMessageSchema,
    ...privateBranchBase,
  })
  .strict();

const replayBranchPrivateSchema = z
  .object({
    revisedUserMessage: canonicalMessageSchema,
    revisedCounterpartMessage: canonicalMessageSchema,
    ...privateBranchBase,
  })
  .strict();

export const simulationTokenPayloadSchema = z
  .object({
    schemaVersion: z.literal(1),
    sessionId: identifierSchema,
    blueprint: z
      .object({
        counterpartRole: blueprintTextSchema,
        communicationStyle: blueprintTextSchema,
        primaryMotivation: blueprintTextSchema,
        concerns: boundedBlueprintListSchema,
        triggers: boundedBlueprintListSchema,
        opennessConditions: boundedBlueprintListSchema,
        knownFacts: boundedBlueprintListSchema,
        boundaries: boundedBlueprintListSchema,
        likelyObjections: boundedBlueprintListSchema,
      })
      .strict(),
    canonicalMessages: z.array(canonicalMessageSchema).min(1).max(25),
    snapshots: z.array(stateSnapshotSchema).min(1).max(25),
    currentState: conversationStateSchema,
    phase: conversationPhaseSchema,
    turnCount: z.number().int().min(0).max(12),
    originalBranchPrivate: originalBranchPrivateSchema.optional(),
    replayBranchPrivate: replayBranchPrivateSchema.optional(),
    issuedAt: z.iso.datetime({ offset: true }),
    expiresAt: z.iso.datetime({ offset: true }),
  })
  .strict()
  .refine(
    ({ issuedAt, expiresAt }) => Date.parse(expiresAt) > Date.parse(issuedAt),
    { message: "The token expiry must follow its issue time." },
  );
