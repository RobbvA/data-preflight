"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import type { DataDomain } from "@/components/data-preflight/WorkspaceLayout";
import {
  profilePickerOptions,
  type ProfilePickerOption,
} from "@/lib/profiles/profilePickerConfig";

type ProfilePickerProps = {
  domain: DataDomain | null;
  onDomainChange: (domain: DataDomain) => void;
  disabled?: boolean;
  hasActiveWorkflow?: boolean;
  profiles?: readonly ProfilePickerOption[];
};

const focusStyle =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent-soft)]";

export function ProfilePicker({
  domain,
  onDomainChange,
  disabled = false,
  hasActiveWorkflow = false,
  profiles = profilePickerOptions,
}: ProfilePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pendingProfile, setPendingProfile] = useState<ProfilePickerOption | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const confirmationId = useId();
  const selected = profiles.find((profile) => profile.domain === domain);
  const SelectedIcon = selected?.icon ?? SlidersHorizontal;
  const searchTerm = query.trim().toLowerCase();
  const visibleProfiles = profiles.filter((profile) =>
    `${profile.name} ${profile.description} ${profile.keywords}`
      .toLowerCase().includes(searchTerm),
  );

  function close(restoreFocus = false) {
    setIsOpen(false);
    setQuery("");
    setPendingProfile(null);
    if (restoreFocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;
    if (pendingProfile) cancelRef.current?.focus();
    else searchRef.current?.focus();
  }, [isOpen, pendingProfile]);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
        setPendingProfile(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  function selectProfile(profile: ProfilePickerOption) {
    if (disabled) return;
    if (profile.domain === domain) {
      close(true);
      return;
    }
    if (hasActiveWorkflow) {
      setPendingProfile(profile);
      return;
    }
    close(true);
    onDomainChange(profile.domain);
  }

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0 || buttons.length === 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0
      : event.key === "End" ? buttons.length - 1
      : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative min-w-0 w-full"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          event.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={`Validation profile: ${selected?.name ?? "Choose a profile"}`}
        aria-expanded={isOpen && !disabled}
        aria-controls={panelId}
        onClick={() => isOpen ? close() : setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-[var(--surface-deep)] p-3 text-left transition hover:border-[var(--brand-accent)] disabled:cursor-wait disabled:opacity-60 ${focusStyle}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(209,154,106,0.1)] text-[var(--brand-accent-soft)]">
          <SelectedIcon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[var(--text-primary)]">
            {selected?.name ?? "Choose a validation profile"}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">
            {selected?.description ?? "Select the data you want to validate."}
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[var(--brand-accent-soft)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <section
          id={panelId}
          aria-label="Available validation profiles"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(26rem,60dvh)] overflow-y-auto overscroll-contain rounded-xl border border-white/15 bg-[var(--surface-raised)] shadow-xl shadow-black/40"
        >
          {pendingProfile ? (
            <div role="group" aria-labelledby={confirmationId} className="p-4">
              <h3 id={confirmationId} className="text-sm font-semibold text-[var(--text-primary)]">
                Switch to {pendingProfile.name}?
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Your current file, mapping and results will be cleared.
                Download any results you need before switching.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button ref={cancelRef} type="button" onClick={() => setPendingProfile(null)} className={`min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-[var(--text-primary)] ${focusStyle}`}>
                  Keep current profile
                </button>
                <button type="button" onClick={() => {
                  const nextDomain = pendingProfile.domain;
                  close(true);
                  onDomainChange(nextDomain);
                }} className={`min-h-11 rounded-lg bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] ${focusStyle}`}>
                  Clear and switch
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 p-3">
                <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-[var(--surface-deep)] px-3 text-[var(--text-secondary)] focus-within:border-[var(--brand-accent-soft)]">
                  <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search validation profiles" placeholder="Search profiles…" className="min-h-11 min-w-0 w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
                </label>
              </div>
              <div role="group" aria-label="Validation profiles" onKeyDown={moveFocus} className="max-h-72 overflow-y-auto overscroll-contain p-2">
                {visibleProfiles.map((profile) => {
                  const Icon = profile.icon;
                  const isSelected = profile.domain === domain;
                  return (
                    <button key={profile.domain} type="button" aria-pressed={isSelected} onClick={() => selectProfile(profile)} className={`flex min-h-16 w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition ${focusStyle} ${isSelected ? "border-[color:rgba(209,154,106,0.45)] bg-[rgba(209,154,106,0.08)]" : "border-transparent hover:bg-white/[0.04]"}`}>
                      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-accent-soft)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[var(--text-primary)]">{profile.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">{profile.description}</span>
                      </span>
                      {isSelected && <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-accent-soft)]" />}
                    </button>
                  );
                })}
                {visibleProfiles.length === 0 && <p role="status" className="p-4 text-sm text-[var(--text-secondary)]">No matching profiles. Try another search.</p>}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
