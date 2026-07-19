"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { saveClientSession } from "@/lib/client-session-storage";
import type { ClientSession, Scenario, ScenarioResponse } from "@/types";

type ScenarioFormValues = Required<Scenario>;
type FieldName = keyof ScenarioFormValues;
type FieldErrors = Partial<Record<FieldName, string>>;
type FormFieldElement = HTMLInputElement | HTMLTextAreaElement;

const fieldOrder: FieldName[] = [
  "counterpart",
  "topic",
  "desiredOutcome",
  "fearedReaction",
  "additionalContext",
];

const limits: Record<FieldName, { min: number; max: number }> = {
  counterpart: { min: 2, max: 100 },
  topic: { min: 10, max: 400 },
  desiredOutcome: { min: 10, max: 400 },
  fearedReaction: { min: 10, max: 400 },
  additionalContext: { min: 0, max: 800 },
};

function validate(values: ScenarioFormValues): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of fieldOrder) {
    const value = values[field];
    const { min, max } = limits[field];

    if (value.length < min) {
      errors[field] = `Enter at least ${min} characters.`;
    } else if (value.length > max) {
      errors[field] = `Keep this to ${max} characters or fewer.`;
    }
  }

  return errors;
}

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

function isScenarioResponse(value: unknown): value is ScenarioResponse {
  if (!isRecord(value) || !isRecord(value.openingMessage)) {
    return false;
  }

  const openingMessage = value.openingMessage;
  const pressureLabels = [
    "Receptive",
    "Guarded",
    "Defensive",
    "Escalating",
  ];

  return (
    typeof value.sessionId === "string" &&
    value.sessionId.length > 0 &&
    typeof value.simulationToken === "string" &&
    value.simulationToken.length > 0 &&
    typeof value.visiblePressureLabel === "string" &&
    pressureLabels.includes(value.visiblePressureLabel) &&
    isBoundedInteger(value.turnCount) &&
    typeof openingMessage.id === "string" &&
    openingMessage.id.length > 0 &&
    (openingMessage.role === "user" ||
      openingMessage.role === "counterpart") &&
    typeof openingMessage.content === "string" &&
    isBoundedInteger(openingMessage.turnNumber)
  );
}

export function ScenarioSetupForm({
  initialScenario,
}: {
  initialScenario: Scenario;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ScenarioFormValues>({
    counterpart: initialScenario.counterpart,
    topic: initialScenario.topic,
    desiredOutcome: initialScenario.desiredOutcome,
    fearedReaction: initialScenario.fearedReaction,
    additionalContext: initialScenario.additionalContext ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldRefs = useRef<Partial<Record<FieldName, FormFieldElement>>>({});

  function updateField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus(null);
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedValues: ScenarioFormValues = {
      counterpart: values.counterpart.trim(),
      topic: values.topic.trim(),
      desiredOutcome: values.desiredOutcome.trim(),
      fearedReaction: values.fearedReaction.trim(),
      additionalContext: values.additionalContext.trim(),
    };
    const nextErrors = validate(trimmedValues);
    const firstInvalidField = fieldOrder.find((field) => nextErrors[field]);

    if (firstInvalidField) {
      setErrors(nextErrors);
      setStatus(null);
      fieldRefs.current[firstInvalidField]?.focus();
      return;
    }

    setValues(trimmedValues);
    setErrors({});
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: trimmedValues }),
      });
      const responseBody: unknown = await response.json();

      if (!response.ok || !isScenarioResponse(responseBody)) {
        throw new Error("Scenario creation failed.");
      }

      const clientSession: ClientSession = {
        id: responseBody.sessionId,
        status: "active",
        stage: "simulation",
        scenario: trimmedValues,
        messages: [responseBody.openingMessage],
        visiblePressureLabel: responseBody.visiblePressureLabel,
        turnCount: responseBody.turnCount,
        debrief: null,
        selectedTurningPointTurnId: null,
        originalBranchDisplay: null,
        replayBranchDisplay: null,
        comparison: null,
        simulationToken: responseBody.simulationToken,
      };

      if (!saveClientSession(clientSession)) {
        throw new Error("Session storage failed.");
      }

      router.push("/simulation");
    } catch {
      setStatus(
        "Something went wrong building the counterpart. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  function describedBy(field: FieldName) {
    return `${field}-guidance ${field}-count${errors[field] ? ` ${field}-error` : ""}`;
  }

  return (
    <form className="setup-form-card" noValidate onSubmit={handleSubmit}>
      <div className="form-heading">
        <h2>Scenario details</h2>
        <p>Keep it specific, but leave out identifying information.</p>
      </div>

      <div className="form-field">
        <label htmlFor="counterpart">Who is the conversation with?</label>
        <input
          aria-describedby={describedBy("counterpart")}
          aria-invalid={Boolean(errors.counterpart)}
          id="counterpart"
          maxLength={limits.counterpart.max}
          minLength={limits.counterpart.min}
          name="counterpart"
          onChange={(event) => updateField("counterpart", event.target.value)}
          placeholder="For example: My manager"
          ref={(element) => {
            fieldRefs.current.counterpart = element ?? undefined;
          }}
          required
          type="text"
          value={values.counterpart}
        />
        <div className="field-guidance">
          <span id="counterpart-guidance">2–100 characters</span>
          <span id="counterpart-count">{values.counterpart.length} / 100</span>
        </div>
        {errors.counterpart ? (
          <p className="field-error" id="counterpart-error">
            {errors.counterpart}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="topic">What do you need to say or ask?</label>
        <textarea
          aria-describedby={describedBy("topic")}
          aria-invalid={Boolean(errors.topic)}
          id="topic"
          maxLength={limits.topic.max}
          minLength={limits.topic.min}
          name="topic"
          onChange={(event) => updateField("topic", event.target.value)}
          placeholder="Describe the main topic or request."
          ref={(element) => {
            fieldRefs.current.topic = element ?? undefined;
          }}
          required
          rows={4}
          value={values.topic}
        />
        <div className="field-guidance">
          <span id="topic-guidance">10–400 characters</span>
          <span id="topic-count">{values.topic.length} / 400</span>
        </div>
        {errors.topic ? (
          <p className="field-error" id="topic-error">
            {errors.topic}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="desiredOutcome">What outcome do you want?</label>
        <textarea
          aria-describedby={describedBy("desiredOutcome")}
          aria-invalid={Boolean(errors.desiredOutcome)}
          id="desiredOutcome"
          maxLength={limits.desiredOutcome.max}
          minLength={limits.desiredOutcome.min}
          name="desiredOutcome"
          onChange={(event) =>
            updateField("desiredOutcome", event.target.value)
          }
          placeholder="Describe the result or next step you hope to reach."
          ref={(element) => {
            fieldRefs.current.desiredOutcome = element ?? undefined;
          }}
          required
          rows={3}
          value={values.desiredOutcome}
        />
        <div className="field-guidance">
          <span id="desiredOutcome-guidance">10–400 characters</span>
          <span id="desiredOutcome-count">
            {values.desiredOutcome.length} / 400
          </span>
        </div>
        {errors.desiredOutcome ? (
          <p className="field-error" id="desiredOutcome-error">
            {errors.desiredOutcome}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="fearedReaction">
          What are you worried they might say or do?
        </label>
        <textarea
          aria-describedby={describedBy("fearedReaction")}
          aria-invalid={Boolean(errors.fearedReaction)}
          id="fearedReaction"
          maxLength={limits.fearedReaction.max}
          minLength={limits.fearedReaction.min}
          name="fearedReaction"
          onChange={(event) =>
            updateField("fearedReaction", event.target.value)
          }
          placeholder="Describe the reaction or objection you are preparing for."
          ref={(element) => {
            fieldRefs.current.fearedReaction = element ?? undefined;
          }}
          required
          rows={3}
          value={values.fearedReaction}
        />
        <div className="field-guidance">
          <span id="fearedReaction-guidance">10–400 characters</span>
          <span id="fearedReaction-count">
            {values.fearedReaction.length} / 400
          </span>
        </div>
        {errors.fearedReaction ? (
          <p className="field-error" id="fearedReaction-error">
            {errors.fearedReaction}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <div className="label-row">
          <label htmlFor="additionalContext">Additional context</label>
          <span>Optional</span>
        </div>
        <textarea
          aria-describedby={describedBy("additionalContext")}
          aria-invalid={Boolean(errors.additionalContext)}
          id="additionalContext"
          maxLength={limits.additionalContext.max}
          name="additionalContext"
          onChange={(event) =>
            updateField("additionalContext", event.target.value)
          }
          placeholder="Add relevant history, responsibilities, agreements, or constraints."
          ref={(element) => {
            fieldRefs.current.additionalContext = element ?? undefined;
          }}
          rows={4}
          value={values.additionalContext}
        />
        <div className="field-guidance">
          <span id="additionalContext-guidance">Up to 800 characters</span>
          <span id="additionalContext-count">
            {values.additionalContext.length} / 800
          </span>
        </div>
        {errors.additionalContext ? (
          <p className="field-error" id="additionalContext-error">
            {errors.additionalContext}
          </p>
        ) : null}
      </div>

      <p className="form-reminder">
        Avoid names, passwords, financial details, or confidential company
        information.
      </p>

      <div className="form-actions">
        <button disabled={isSubmitting} type="submit">
          {isSubmitting
            ? "Building a realistic counterpart…"
            : "Start rehearsal"}
        </button>
        <Link href="/">Back</Link>
      </div>

      <div className="form-status" aria-live="assertive" role="alert">
        {status}
      </div>

      <p className="simulation-note">
        Unsaid creates a possible practice scenario. It cannot predict how a
        real person will respond.
      </p>
    </form>
  );
}
