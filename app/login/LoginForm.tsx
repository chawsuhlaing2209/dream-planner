"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import styles from "./login.module.css";

export function LoginForm({ next, ready }: { next: string; ready: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  return (
    <form action={action} className={styles.card}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="passcode">Family passcode</label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        autoComplete="current-password"
        className={styles.input}
        required
        autoFocus
        disabled={!ready}
        aria-describedby={state.error ? "login-error" : undefined}
      />
      <button type="submit" className={styles.button} disabled={pending || !ready}>
        {pending ? "Checking" : "Open the planner"}
      </button>
      {!ready ? (
        <p className={styles.error} role="alert">
          Login is not set up yet. Add APP_PASSCODE and SESSION_SECRET to .env.local, then restart.
        </p>
      ) : state.error ? (
        <p id="login-error" className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
