"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadClientSession } from "@/lib/client-session-storage";
import type { ClientSession } from "@/types";

export default function SimulationPage() {
  const [session, setSession] = useState<ClientSession | null>();

  useEffect(() => {
    const loadSession = window.setTimeout(() => {
      setSession(loadClientSession());
    }, 0);

    return () => window.clearTimeout(loadSession);
  }, []);

  if (session === undefined) {
    return (
      <div className="simulation-shell">
        <main className="simulation-state" aria-live="polite">
          <p>Loading rehearsal…</p>
        </main>
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="simulation-shell">
        <header className="site-header simulation-header">
          <nav className="site-nav" aria-label="Rehearsal navigation">
            <Link className="wordmark" href="/">
              Unsaid
            </Link>
            <span className="product-label">Rehearsal</span>
          </nav>
        </header>
        <main className="simulation-state">
          <p className="eyebrow">Rehearsal unavailable</p>
          <h1>No active rehearsal was found.</h1>
          <Link className="primary-cta" href="/setup">
            Set up a conversation
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="simulation-shell">
      <header className="site-header simulation-header">
        <nav className="site-nav" aria-label="Rehearsal navigation">
          <Link className="wordmark" href="/">
            Unsaid
          </Link>
          <span className="product-label">Rehearsal</span>
        </nav>
      </header>

      <main className="simulation-main">
        <section className="simulation-title" aria-labelledby="rehearsal-title">
          <div>
            <p className="eyebrow">Conversation workspace</p>
            <h1 id="rehearsal-title">
              Rehearsal with {session.scenario.counterpart}
            </h1>
            <p>AI simulation estimate — not a prediction of a real person.</p>
          </div>
          <dl className="simulation-status" aria-label="Rehearsal status">
            <div>
              <dt>Pressure</dt>
              <dd>{session.visiblePressureLabel}</dd>
            </div>
            <div>
              <dt>Progress</dt>
              <dd>Turn {session.turnCount} of 12</dd>
            </div>
          </dl>
        </section>

        <section className="conversation-panel" aria-labelledby="transcript-title">
          <div className="conversation-heading">
            <div>
              <p className="section-kicker">Live practice</p>
              <h2 id="transcript-title">Conversation</h2>
            </div>
            <span className="pressure-badge">
              {session.visiblePressureLabel}
            </span>
          </div>

          <ol className="message-list" aria-label="Conversation transcript">
            {session.messages.map((message) => (
              <li
                className={`message-row message-row-${message.role}`}
                key={message.id}
              >
                <article className="message-bubble">
                  <p className="message-speaker">
                    {message.role === "counterpart"
                      ? session.scenario.counterpart
                      : "You"}
                  </p>
                  <p>{message.content}</p>
                </article>
              </li>
            ))}
          </ol>

          <div className="conversation-composer">
            <label htmlFor="rehearsal-message">Your response</label>
            <textarea
              disabled
              id="rehearsal-message"
              placeholder="Write what you would say…"
              rows={4}
            />
            <div className="composer-actions">
              <p>Turn-by-turn responses will be connected in the next build step.</p>
              <button disabled type="button">
                Send
              </button>
            </div>
          </div>
        </section>

        <div className="simulation-footer-action">
          <button disabled type="button">
            End rehearsal
          </button>
        </div>
      </main>
    </div>
  );
}
