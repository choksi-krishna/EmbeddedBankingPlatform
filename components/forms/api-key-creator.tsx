"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/forms/submit-button";

type ActionState = {
  error?: string;
  rawKey?: string;
};

type ApiKeyCreatorProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export function ApiKeyCreator({ action }: ApiKeyCreatorProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Key Name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Production API"
          className="field"
        />
      </div>

      <SubmitButton label="Create API Key" pendingLabel="Generating key..." />

      {state.error ? (
        <p className="text-sm text-rose-700">{state.error}</p>
      ) : null}

      {state.rawKey ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            Copy now
          </p>
          <p className="mt-3 break-all rounded-xl bg-white px-3 py-3 font-mono text-sm text-ink">
            {state.rawKey}
          </p>
        </div>
      ) : null}
    </form>
  );
}
