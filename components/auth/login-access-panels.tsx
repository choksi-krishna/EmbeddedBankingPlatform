"use client";

import { useEffect, useId, useState } from "react";

import { SubmitButton } from "@/components/forms/submit-button";
import { cn } from "@/lib/utils";

import { loginAction, magicLinkAction } from "@/app/(auth)/actions";

type LoginAccessPanelsProps = {
  defaultTab: "password" | "magic-link";
  prefilledEmail: string;
  error: string | null;
  message: string | null;
  magicLinkEnabled: boolean;
};

const tabs = [
  {
    id: "password" as const,
    label: "Password",
    description: "Use your email and password.",
  },
  {
    id: "magic-link" as const,
    label: "Magic Link",
    description: "Recover access without a password.",
  },
];

function PanelIntro({
  title,
  description,
  badge,
  badgeClassName,
}: {
  title: string;
  description: string;
  badge: string;
  badgeClassName: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white",
          badgeClassName,
        )}
      >
        {badge}
      </span>
    </div>
  );
}

function FormError({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }

  return <p className="text-sm text-rose-700">{error}</p>;
}

export function LoginAccessPanels({
  defaultTab,
  prefilledEmail,
  error,
  message,
  magicLinkEnabled,
}: LoginAccessPanelsProps) {
  const [activeTab, setActiveTab] = useState<"password" | "magic-link">(
    magicLinkEnabled ? defaultTab : "password",
  );
  const tabGroupId = useId();

  useEffect(() => {
    setActiveTab(magicLinkEnabled ? defaultTab : "password");
  }, [defaultTab, magicLinkEnabled]);

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
          {message}
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Login methods"
        className="grid grid-cols-2 gap-2 rounded-[26px] bg-[rgba(15,23,42,0.05)] p-1.5"
      >
        {tabs.map((tab) => {
          const disabled = tab.id === "magic-link" && !magicLinkEnabled;
          const active = activeTab === tab.id;
          const panelId = `${tabGroupId}-${tab.id}-panel`;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              id={`${tabGroupId}-${tab.id}-tab`}
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setActiveTab(tab.id);
                }
              }}
              className={cn(
                "rounded-[22px] px-4 py-3 text-left transition",
                active
                  ? "bg-white text-ink shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
                  : "text-slate-500 hover:bg-white/70 hover:text-ink",
                disabled && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-500",
              )}
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className="mt-1 block text-xs leading-5">{tab.description}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "password" ? (
        <section
          role="tabpanel"
          id={`${tabGroupId}-password-panel`}
          aria-labelledby={`${tabGroupId}-password-tab`}
          className="rounded-[28px] border border-[rgba(17,24,39,0.08)] bg-white/85 p-5 shadow-[0_18px_40px_rgba(17,24,39,0.06)]"
        >
          <PanelIntro
            title="Use your password"
            description="Sign in directly if you already know your credentials."
            badge="Email Login"
            badgeClassName="bg-ink"
          />
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                className="field"
                id="email"
                name="email"
                type="email"
                required
                defaultValue={prefilledEmail}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                className="field"
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <FormError error={activeTab === defaultTab ? error : null} />
            <SubmitButton
              label="Sign In"
              pendingLabel="Signing in..."
              className="w-full"
            />
          </form>
        </section>
      ) : null}

      {activeTab === "magic-link" && magicLinkEnabled ? (
        <section
          role="tabpanel"
          id={`${tabGroupId}-magic-link-panel`}
          aria-labelledby={`${tabGroupId}-magic-link-tab`}
          className="rounded-[28px] border border-[rgba(15,118,110,0.18)] bg-[linear-gradient(180deg,rgba(240,253,250,0.95),rgba(255,255,255,0.96))] p-5 shadow-[0_18px_40px_rgba(15,118,110,0.08)]"
        >
          <PanelIntro
            title="Recover with magic link"
            description="Best for existing workspaces, passwordless access, or account recovery."
            badge="Recommended"
            badgeClassName="bg-tide"
          />
          <form action={magicLinkAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="magicLinkEmail">
                Workspace Email
              </label>
              <input
                className="field"
                id="magicLinkEmail"
                name="email"
                type="email"
                required
                defaultValue={prefilledEmail}
              />
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
              We will email a secure sign-in link for this workspace and take you
              back into the dashboard after verification.
            </div>
            <FormError error={activeTab === defaultTab ? error : null} />
            <SubmitButton
              label="Send Magic Link"
              pendingLabel="Sending..."
              className="w-full"
            />
          </form>
        </section>
      ) : null}
    </div>
  );
}
