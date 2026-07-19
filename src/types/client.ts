import type {
  ComparisonResult,
  Identifier,
  MessageRole,
  PressureLabel,
  SessionStatus,
  WorkflowStage,
} from "./primitives";

export interface Scenario {
  counterpart: string;
  topic: string;
  desiredOutcome: string;
  fearedReaction: string;
  additionalContext?: string;
}

export interface ClientMessage {
  id: Identifier;
  role: MessageRole;
  content: string;
  turnNumber: number;
}

export interface DebriefStrength {
  evidenceTurnId: Identifier;
  observation: string;
}

export interface TurningPointDisplay {
  turnId: Identifier;
  quote: string;
  whyItMattered: string;
}

export interface Debrief {
  outcome: string;
  strengths: DebriefStrength[];
  turningPoint: TurningPointDisplay;
  betterResponse: string;
  reactionToPrepareFor: string;
  primaryFocus: string;
  disclaimer: string;
}

export interface OriginalBranchDisplay {
  userMessage: ClientMessage;
  counterpartMessage: ClientMessage;
  pressureLabel: PressureLabel;
}

export interface ReplayBranchDisplay {
  userMessage: ClientMessage;
  counterpartMessage: ClientMessage;
  pressureLabel: PressureLabel;
}

export interface ReplayComparison {
  originalStateLabel: PressureLabel;
  revisedStateLabel: PressureLabel;
  result: ComparisonResult;
  whatChanged: string;
  finalFocus: string;
}

/** Complete session shape safe to expose to the browser. */
export interface ClientSession {
  id: Identifier;
  status: SessionStatus;
  stage: WorkflowStage;
  scenario: Scenario;
  messages: ClientMessage[];
  visiblePressureLabel: PressureLabel;
  turnCount: number;
  debrief: Debrief | null;
  selectedTurningPointTurnId: Identifier | null;
  originalBranchDisplay: OriginalBranchDisplay | null;
  replayBranchDisplay: ReplayBranchDisplay | null;
  comparison: ReplayComparison | null;
  simulationToken: string;
}
