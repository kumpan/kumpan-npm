import { isArgumentsObject } from "node:util/types";
import { renderHook } from "@testing-library/react";
import Cookies from "universal-cookie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import gtag, { DEFAULT_COOKIE_NAME } from "./useGTM";
import { useGTM } from "./useGTM";

describe("Google Tag Manager", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { location: { hostname: "localhost" } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  describe("gtag", () => {
    it("uses a default dataLayerName", () => {
      expect(gtag.prototype.dataLayerName).toBeDefined();
      gtag("foo");
      expect(window[gtag.prototype.dataLayerName]).toContain("foo");
    });

    it("can change dataLayerName", () => {
      const defaultName = gtag.prototype.dataLayerName;

      gtag.prototype.dataLayerName = "foobar";
      gtag("foo");

      //@ts-ignore
      expect(window.foobar).toContain("foo");

      gtag.prototype.dataLayerName = defaultName;
    });

    it("returns the layer with no parameters", () => {
      const layer = gtag();
      expect(layer).toHaveLength(0);
      gtag("foo");
      expect(layer).toContain("foo");
    });
  });

  describe("useGTM", () => {
    it("loads decision state from cookie", () => {
      const cookies = new Cookies();
      cookies.set(DEFAULT_COOKIE_NAME, { ad_storage: "granted" });
      const gtm = { gtmId: "MOCKED" };

      const { result } = renderHook(() => useGTM(gtm));

      expect(result.current.getDecision("ad_storage")).toBe(true);

      cookies.remove(DEFAULT_COOKIE_NAME);
    });

    it("stores reject all in a cookie", () => {
      const gtm = { gtmId: "MOCKED", consentTypes: ["ad_personalization" as const] };

      const { result, rerender } = renderHook(() => useGTM(gtm));
      result.current.rejectAll();
      result.current.confirmDecision();
      rerender();

      const cookies = new Cookies(document.cookie);
      expect(cookies.get(DEFAULT_COOKIE_NAME)).toMatchObject({ ad_personalization: "denied" });

      cookies.remove(DEFAULT_COOKIE_NAME);
    });

    it("pushes tag when all types are accepted", () => {
      const gtm = {
        gtmId: "MOCKED",
        consentTypes: ["ad_personalization" as const, "ad_storage" as const],
      };
      const layer = gtag();

      const { result, rerender } = renderHook(() => useGTM(gtm));
      result.current.acceptAll();
      rerender();

      const lastEntry = layer.at(-1);
      const asArray = isArgumentsObject(lastEntry) ? Array.from(lastEntry) : lastEntry;

      expect(asArray).toMatchObject([
        "consent",
        "update",
        { ad_storage: "granted", ad_personalization: "granted" },
      ]);
    });

    it("does not push tag when all are rejected", () => {
      const gtm = {
        gtmId: "MOCKED",
        consentTypes: ["ad_personalization" as const, "ad_storage" as const],
      };
      const layer = gtag();

      const { result, rerender } = renderHook(() => useGTM(gtm));
      result.current.rejectAll();
      rerender();

      const lastEntry = layer.at(-1);
      const asArray = isArgumentsObject(lastEntry) ? Array.from(lastEntry) : lastEntry;

      expect(asArray).not.toMatchObject([
        "consent",
        "update",
        { ad_storage: "granted", ad_personalization: "granted" },
      ]);
    });

    it("pushes tag when a granted decision is confirmed", () => {
      const gtm = {
        gtmId: "MOCKED",
        consentTypes: ["ad_personalization" as const, "ad_storage" as const],
      };
      const layer = gtag();

      const { result, rerender } = renderHook(() => useGTM(gtm));
      result.current.handleConsent("ad_storage", true);
      rerender();

      let lastEntry = layer.at(-1);
      let asArray = isArgumentsObject(lastEntry) ? Array.from(lastEntry) : lastEntry;

      expect(asArray).not.toMatchObject(["consent", "update", { ad_storage: "granted" }]);

      result.current.confirmDecision();
      rerender();
      lastEntry = layer.at(-1);
      asArray = isArgumentsObject(lastEntry) ? Array.from(lastEntry) : lastEntry;

      expect(asArray).toMatchObject(["consent", "update", { ad_storage: "granted" }]);
    });

    it("does not push tag with when no consent is granted", () => {
      const gtm = {
        gtmId: "MOCKED",
        consentTypes: ["ad_personalization" as const, "ad_storage" as const],
      };
      const layer = gtag();

      const { result, rerender } = renderHook(() => useGTM(gtm));
      result.current.handleConsent("ad_storage", false);
      rerender();

      const lastEntry = layer.at(-1);
      const asArray = isArgumentsObject(lastEntry) ? Array.from(lastEntry) : lastEntry;

      expect(asArray).not.toMatchObject(["consent", "update", { ad_storage: false }]);
    });
  });
});
