"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type InlineTitleProps = {
  value: string;
  onSave: (next: string) => void;
  /** Rendered as a heading; pass `h1`/`span` to match the surrounding layout. */
  as?: "h1" | "h2" | "h3" | "span" | "p";
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  "aria-label"?: string;
};

/**
 * A title that turns into an input on double-click, or on Enter/Space when it
 * has focus — which is what makes it reachable without a mouse.
 *
 * Escape reverts, blur commits, and an empty value is ignored so a stray click
 * cannot blank a title.
 */
export function InlineTitle({
  value,
  onSave,
  as: Tag = "span",
  className,
  inputClassName,
  placeholder = "Untitled",
  "aria-label": ariaLabel = "Board title",
}: InlineTitleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== value) {
      onSave(next);
    } else {
      setDraft(value);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          inputClassName ?? className,
        )}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            cancel();
          }
          // The dialog-level Escape handler must not also fire.
          event.stopPropagation();
        }}
        // Clicks inside the editor must not navigate to the board.
        onClick={(event) => event.stopPropagation()}
      />
    );
  }

  return (
    <Tag
      className={cn(
        "cursor-text truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      title="Double-click to rename"
      tabIndex={0}
      role="button"
      aria-label={`${ariaLabel}. Double-click to rename.`}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setEditing(true);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          setEditing(true);
        }
      }}
    >
      {value || placeholder}
    </Tag>
  );
}
