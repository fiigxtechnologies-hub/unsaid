export type WorkflowStage =
  | "landing"
  | "setup"
  | "simulation"
  | "debrief"
  | "replay"
  | "comparison";

export type SessionStatus = "active" | "completed" | "replay";

export type MessageRole = "user" | "counterpart";

export type ConversationPhase =
  | "opening"
  | "exploration"
  | "resistance"
  | "negotiation"
  | "resolution";

export type PressureLabel =
  | "Receptive"
  | "Guarded"
  | "Defensive"
  | "Escalating";

export type ComparisonResult =
  | "more_productive"
  | "slightly_improved"
  | "similar"
  | "more_resistant";

export interface CommunicationSignals {
  positive: string[];
  negative: string[];
}

/** Stable identifier shared across client and private contracts. */
export type Identifier = string;
