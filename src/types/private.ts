import type {
  ConversationPhase,
  Identifier,
  MessageRole,
  PressureLabel,
} from "./primitives";

export interface PersonaBlueprint {
  counterpartRole: string;
  communicationStyle: string;
  primaryMotivation: string;
  concerns: string[];
  triggers: string[];
  opennessConditions: string[];
  knownFacts: string[];
  boundaries: string[];
  likelyObjections: string[];
}

export interface ConversationState {
  receptivity: number;
  defensiveness: number;
  trust: number;
  askClarity: number;
  resolutionLikelihood: number;
}

export interface CanonicalMessage {
  id: Identifier;
  role: MessageRole;
  content: string;
  turnNumber: number;
  order: number;
}

export interface StateSnapshot {
  afterMessageId: Identifier;
  state: ConversationState;
  phase: ConversationPhase;
}

export interface OriginalBranchPrivate {
  turningPointTurnId: Identifier;
  precedingMessageId: Identifier;
  preTurnState: ConversationState;
  preTurnPhase: ConversationPhase;
  originalUserMessage: CanonicalMessage;
  originalCounterpartMessage: CanonicalMessage;
  resultingState: ConversationState;
  resultingPhase: ConversationPhase;
  resultingPressureLabel: PressureLabel;
}

export interface ReplayBranchPrivate {
  revisedUserMessage: CanonicalMessage;
  revisedCounterpartMessage: CanonicalMessage;
  resultingState: ConversationState;
  resultingPhase: ConversationPhase;
  resultingPressureLabel: PressureLabel;
}

/** Private state carried by the signed simulation token. */
export interface SimulationTokenPayload {
  schemaVersion: number;
  sessionId: Identifier;
  blueprint: PersonaBlueprint;
  canonicalMessages: CanonicalMessage[];
  snapshots: StateSnapshot[];
  currentState: ConversationState;
  phase: ConversationPhase;
  turnCount: number;
  originalBranchPrivate?: OriginalBranchPrivate;
  replayBranchPrivate?: ReplayBranchPrivate;
  /** ISO 8601 timestamp. */
  issuedAt: string;
  /** ISO 8601 timestamp. */
  expiresAt: string;
}
