import type {
  ClientMessage,
  Debrief,
  OriginalBranchDisplay,
  ReplayComparison,
  Scenario,
} from "./client";
import type { Identifier, PressureLabel } from "./primitives";

export interface ScenarioRequest {
  scenario: Scenario;
}

export interface ScenarioResponse {
  openingMessage: ClientMessage;
  visiblePressureLabel: PressureLabel;
  turnCount: number;
  simulationToken: string;
}

export interface SimulationTurnRequest {
  simulationToken: string;
  userMessageContent: string;
}

export interface SimulationTurnResponse {
  userMessage: ClientMessage;
  counterpartMessage: ClientMessage;
  visiblePressureLabel: PressureLabel;
  turnCount: number;
  conversationMayEnd: boolean;
  simulationToken: string;
}

export interface DebriefRequest {
  simulationToken: string;
}

export interface DebriefResponse {
  debrief: Debrief;
  selectedTurningPointTurnId: Identifier;
  originalBranchDisplay: OriginalBranchDisplay;
  simulationToken: string;
}

export interface ReplayTurnRequest {
  simulationToken: string;
  turningPointTurnId: Identifier;
  revisedMessageContent: string;
}

export interface ReplayTurnResponse {
  revisedUserMessage: ClientMessage;
  revisedCounterpartMessage: ClientMessage;
  revisedPressureLabel: PressureLabel;
  simulationToken: string;
}

export interface ReplayCompareRequest {
  simulationToken: string;
}

export interface ReplayCompareResponse {
  comparison: ReplayComparison;
  simulationToken: string;
}

export type ApiErrorCode =
  | "validation_failed"
  | "invalid_token"
  | "turn_limit_reached"
  | "invalid_turning_point"
  | "branches_incomplete"
  | "model_output_invalid"
  | "rate_limited"
  | "unavailable";

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
