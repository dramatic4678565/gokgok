import React from "react";

import { SHOW_UPSTREAM_PROMOS } from "@mosaic/common";
import { Mosaic } from "@mosaic/mosaic";

import { Keyboard } from "./helpers/ui";
import { mockBoundingClientRect, render, toggleMenu } from "./test-utils";

/**
 * Locks in the invariant behind `SHOW_UPSTREAM_PROMOS`.
 *
 * With the flag off, nothing in the editor may link at an upstream service: on
 * a self-hosted Mosaic those all point at someone else's site. The code behind
 * each one is deliberately kept (upstream is merged every six hours, so a
 * deleted block comes back as a conflict), which means this cannot be checked
 * by grepping -- a gated block still contains the URL, and forgetting the gate
 * is silent. See BRANDING.md.
 *
 * This covers the surfaces in `packages/mosaic`. The app-level ones (command
 * palette, export dialog, welcome screen, crash screen) live in `mosaic-app`
 * and are gated on the same flag.
 */
const UPSTREAM = /excalidraw|discord\.gg|youtube\.com|github\.com/;

const upstreamLinks = () =>
  [...document.querySelectorAll("a")]
    .map((a) => a.getAttribute("href") ?? "")
    .filter((href) => UPSTREAM.test(href));

describe("SHOW_UPSTREAM_PROMOS hides every upstream promotion", () => {
  beforeEach(async () => {
    localStorage.clear();
    mockBoundingClientRect();
    await render(<Mosaic autoFocus={true} handleKeyboardGlobally={true} />);
  });

  it("is off by default", () => {
    expect(SHOW_UPSTREAM_PROMOS).toBe(false);
  });

  it("the help dialog keeps its shortcuts but links to nothing upstream", () => {
    Keyboard.keyDown("?", document);

    expect(document.querySelector(".HelpDialog")).not.toBeNull();
    expect(document.querySelector(".HelpDialog__island")).not.toBeNull();
    expect(upstreamLinks()).toEqual([]);
  });

  it("the main menu links to nothing upstream", () => {
    toggleMenu(document.querySelector(".excalidraw") as HTMLElement);

    expect(upstreamLinks()).toEqual([]);
  });

  it("the app links to nothing upstream", () => {
    expect(upstreamLinks()).toEqual([]);
  });
});
