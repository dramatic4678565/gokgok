import React from "react";
import { vi } from "vitest";

import { resolvablePromise } from "@mosaic/common";

import { Mosaic, CaptureUpdateAction } from "../../index";
import { API } from "../helpers/api";
import { Pointer } from "../helpers/ui";
import { render, unmountComponent } from "../test-utils";

import type { MosaicImperativeAPI } from "../../types";

describe("event callbacks", () => {
  const h = window.h;

  let mosaicAPI: MosaicImperativeAPI;

  const mouse = new Pointer("mouse");

  beforeEach(async () => {
    const mosaicAPIPromise = resolvablePromise<MosaicImperativeAPI>();
    await render(
      <Mosaic
        onMosaicAPI={(api) => mosaicAPIPromise.resolve(api as any)}
      />,
    );
    mosaicAPI = await mosaicAPIPromise;
  });

  it("should resolve editor:mount/editor:initialize when subscribed before mount", async () => {
    unmountComponent();

    const lifecyclePromise = resolvablePromise<{
      api: MosaicImperativeAPI;
      mount: Promise<{
        mosaicAPI: MosaicImperativeAPI;
        container: HTMLDivElement | null;
      }>;
      initialize: Promise<MosaicImperativeAPI>;
    }>();

    await render(
      <Mosaic
        onMosaicAPI={(api) => {
          if (api) {
            lifecyclePromise.resolve({
              api,
              mount: api.onEvent("editor:mount"),
              initialize: api.onEvent("editor:initialize"),
            });
          }
        }}
      />,
    );

    const { api, mount, initialize } = await lifecyclePromise;
    await expect(mount).resolves.toEqual({
      mosaicAPI: api,
      container: expect.any(HTMLDivElement),
    });
    await expect(initialize).resolves.toBe(api);
  });

  it("should replay editor:mount/editor:initialize to late subscribers", async () => {
    const onMount = vi.fn();
    const onInitialize = vi.fn();

    mosaicAPI.onEvent("editor:mount", onMount);
    mosaicAPI.onEvent("editor:initialize", onInitialize);

    await Promise.resolve();

    expect(onMount).toHaveBeenCalledTimes(1);
    expect(onMount).toHaveBeenCalledWith({
      mosaicAPI,
      container: expect.any(HTMLDivElement),
    });
    expect(onInitialize).toHaveBeenCalledTimes(1);
    expect(onInitialize).toHaveBeenCalledWith(mosaicAPI);

    await expect(mosaicAPI.onEvent("editor:mount")).resolves.toEqual({
      mosaicAPI,
      container: expect.any(HTMLDivElement),
    });
    await expect(mosaicAPI.onEvent("editor:initialize")).resolves.toBe(
      mosaicAPI,
    );
  });

  it("should call onMount before onInitialize props", async () => {
    unmountComponent();

    const calls: string[] = [];

    await render(
      <Mosaic
        onMount={({ mosaicAPI, container }) => {
          expect(mosaicAPI).toBeDefined();
          expect(container).toBeInstanceOf(HTMLDivElement);
          calls.push("mount");
        }}
        onInitialize={() => {
          calls.push("initialize");
        }}
      />,
    );

    expect(calls).toEqual(["mount", "initialize"]);
  });

  it("should trigger onChange on render", async () => {
    const onChange = vi.fn();

    const origBackgroundColor = h.state.viewBackgroundColor;
    mosaicAPI.onChange(onChange);
    API.updateScene({
      appState: { viewBackgroundColor: "red" },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
    expect(onChange).toHaveBeenCalledWith(
      // elements
      [],
      // appState
      expect.objectContaining({
        viewBackgroundColor: "red",
      }),
      // files
      {},
    );
    expect(onChange.mock?.lastCall?.[1].viewBackgroundColor).not.toBe(
      origBackgroundColor,
    );
  });

  it("should trigger onPointerDown/onPointerUp on canvas pointerDown/pointerUp", async () => {
    const onPointerDown = vi.fn();
    const onPointerUp = vi.fn();

    mosaicAPI.onPointerDown(onPointerDown);
    mosaicAPI.onPointerUp(onPointerUp);

    mouse.downAt(100);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(onPointerUp).not.toHaveBeenCalled();
    mouse.up();
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(onPointerUp).toHaveBeenCalledTimes(1);
  });
});
