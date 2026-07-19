"use client";

import type { ClientMessage, ClientSession, Scenario } from "@/types";

const CLIENT_SESSION_KEY = "unsaid.client-session.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedInteger(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 12
  );
}

function isScenario(value: unknown): value is Scenario {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.counterpart === "string" &&
    typeof value.topic === "string" &&
    typeof value.desiredOutcome === "string" &&
    typeof value.fearedReaction === "string" &&
    (value.additionalContext === undefined ||
      typeof value.additionalContext === "string")
  );
}

function isClientMessage(value: unknown): value is ClientMessage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    (value.role === "user" || value.role === "counterpart") &&
    typeof value.content === "string" &&
    isBoundedInteger(value.turnNumber)
  );
}

function isNullableRecord(value: unknown) {
  return value === null || isRecord(value);
}

function isClientSession(value: unknown): value is ClientSession {
  if (!isRecord(value)) {
    return false;
  }

  const pressureLabels = [
    "Receptive",
    "Guarded",
    "Defensive",
    "Escalating",
  ];
  const statuses = ["active", "completed", "replay"];
  const stages = [
    "landing",
    "setup",
    "simulation",
    "debrief",
    "replay",
    "comparison",
  ];

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.status === "string" &&
    statuses.includes(value.status) &&
    typeof value.stage === "string" &&
    stages.includes(value.stage) &&
    isScenario(value.scenario) &&
    Array.isArray(value.messages) &&
    value.messages.every(isClientMessage) &&
    typeof value.visiblePressureLabel === "string" &&
    pressureLabels.includes(value.visiblePressureLabel) &&
    isBoundedInteger(value.turnCount) &&
    isNullableRecord(value.debrief) &&
    (value.selectedTurningPointTurnId === null ||
      typeof value.selectedTurningPointTurnId === "string") &&
    isNullableRecord(value.originalBranchDisplay) &&
    isNullableRecord(value.replayBranchDisplay) &&
    isNullableRecord(value.comparison) &&
    typeof value.simulationToken === "string" &&
    value.simulationToken.length > 0
  );
}

export function saveClientSession(session: ClientSession): boolean {
  try {
    window.localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function loadClientSession(): ClientSession | null {
  try {
    const storedSession = window.localStorage.getItem(CLIENT_SESSION_KEY);

    if (!storedSession) {
      return null;
    }

    const parsedSession: unknown = JSON.parse(storedSession);

    if (!isClientSession(parsedSession)) {
      window.localStorage.removeItem(CLIENT_SESSION_KEY);
      return null;
    }

    return parsedSession;
  } catch {
    try {
      window.localStorage.removeItem(CLIENT_SESSION_KEY);
    } catch {
      // localStorage can be unavailable in privacy-restricted browser contexts.
    }

    return null;
  }
}

export function clearClientSession(): void {
  try {
    window.localStorage.removeItem(CLIENT_SESSION_KEY);
  } catch {
    // localStorage can be unavailable in privacy-restricted browser contexts.
  }
}
