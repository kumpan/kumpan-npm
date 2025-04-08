"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "universal-cookie";

export const DEFAULT_COOKIE_NAME = "gtm_consent";

/*
 * @hook useGTM
 *
 * React Hook to initialize and interact with Google Tag Manager.
 * Requires <GTMScript> in <head /> of the document
 */
export const useGTM = ({ cookieOptions, dataLayerName, consentTypes = [] }: GTMParams = {}) => {
  //
  // ** State
  //
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);
  const [decision, setDecision] = useState<Decision>();
  const [confirmed, setConfirmed] = useState(false);

  //
  // ** Internal
  //
  if (dataLayerName) {
    gtag.prototype.dataLayerName = dataLayerName;
  }

  const init = useCallback(() => {
    if (initialized) {
      return;
    }
    const dataLayer = gtag();
    const layerAlreadyInitialized = dataLayer.some(
      (evt: unknown) => evt && typeof evt === "object" && "gtm.start" in evt,
    );

    if (layerAlreadyInitialized) {
      setInitialized(true);
    } else {
      gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      setInitialized(true);
    }
  }, [initialized]);

  //
  // ** Effects
  //
  // @effect - Triggers init and loads decision from cookies
  useEffect(() => {
    if (ready) {
      return;
    }
    if (!initialized) {
      init();
      return;
    }

    if (decision) {
      return;
    }

    const cookie = getConsentCookie(cookieOptions);

    // TODO: Validate cookie
    if (cookie) {
      setDecision(cookie);
    }
    setReady(true);
  }, [decision, initialized, cookieOptions, init, ready]);

  // @effect - Stores the decision in cookies and pushes tags if anything was granted
  useEffect(() => {
    if (!ready || !decision) {
      return;
    }

    const anythingIsGranted = decision && Object.values(decision).some((choice) => !!choice);

    setConsentCookie(decision, cookieOptions);

    if (anythingIsGranted && confirmed) {
      gtag("consent", "update", decision);
    }
  }, [decision, ready, cookieOptions, confirmed]);

  //
  // ** Functions
  //
  const acceptAll = useCallback(() => {
    setDecision(buildDecisionRecord(consentTypes, true));
    setConfirmed(true);
  }, [consentTypes]);

  const rejectAll = useCallback(() => {
    setDecision(buildDecisionRecord(consentTypes, false));
    setConfirmed(true);
  }, [consentTypes]);

  const handleConsent = useCallback(
    (consent: GTMConsentType, choice: boolean) => {
      setDecision({ ...decision, [consent]: choice ? "granted" : undefined });
    },
    [decision],
  );

  const confirmDecision = useCallback(() => decision && setConfirmed(true), [decision]);

  const getDecision = useCallback(
    (consentType: GTMConsentType) => decision?.[consentType] === "granted",
    [decision],
  );

  const hasMadeDecision = useCallback(() => {
    return !!decision || !!getConsentCookie(cookieOptions);
  }, [decision, cookieOptions]);

  return useMemo(
    () => ({
      handleConsent,
      acceptAll,
      rejectAll,
      decision,
      ready,
      confirmDecision,
      getDecision,
      hasMadeDecision,
    }),
    [
      handleConsent,
      acceptAll,
      rejectAll,
      decision,
      ready,
      confirmDecision,
      getDecision,
      hasMadeDecision,
    ],
  );
};

// ** Cookies
const getConsentCookie = (opts?: GTMCookieOptions) => {
  const cookies = new Cookies(document.cookie);
  const cookieName = opts?.name || DEFAULT_COOKIE_NAME;
  return cookies.get(cookieName);
};

const setConsentCookie = (decision: Decision, opts?: GTMCookieOptions) => {
  const cookies = new Cookies(document.cookie);
  const cookieName = opts?.name || DEFAULT_COOKIE_NAME;
  cookies.set(cookieName, decision, {
    expires: opts?.expires || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    path: opts?.path || "/",
    domain: opts?.domain || window.location.hostname,
  });
};

// ** Utilities
export const useGTMUrl = ({ gtmId, auth, preview }: GTMParams) => {
  if (!gtmId) {
    return null;
  }

  return useMemo(() => {
    const gtmPreview = preview ? `&gtm_preview=${preview}&gtm_cookies_win=x` : "";
    const gtmAuth = auth ? `&gtm_auth=${auth}` : "";
    const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${gtmId}${gtmAuth}${gtmPreview}`;
    return gtmUrl;
  }, [gtmId, auth, preview]);
};

const buildDecisionRecord = (consentTypes: Array<GTMConsentType>, granted?: boolean) =>
  consentTypes?.reduce((acc, cur) => {
    if (granted === undefined) return acc;
    acc[cur] = granted ? "granted" : "denied";
    return acc;
  }, {} as Decision);

// ** Components
export const GTMScript = ({ params }: { params: GTMParams }) => {
  const url = useGTMUrl(params);

  if (!url) {
    return null;
  }

  return (
    <Script
      strategy="afterInteractive"
      async
      id="_next-gtm-script"
      src={url}
      nonce={params.nonce}
    />
  );
};

export const GTMNoScript = ({ params }: { params: GTMParams }) => {
  const url = useGTMUrl(params);

  if (!url) {
    return null;
  }

  return (
    <noscript>
      <iframe
        title="Google Tag Manager noscript"
        src={url}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
};

export default function gtag(..._args: unknown[]) {
  const dataLayerName = gtag.prototype.dataLayerName;
  //@ts-ignore
  window[dataLayerName] = window[dataLayerName] || [];
  const dataLayer = window[dataLayerName] as unknown as Array<unknown>;

  const data = arguments.length > 1 ? arguments : arguments[0];
  if (data) {
    //@ts-ignore
    dataLayer.push(data);
  }
  return dataLayer;
}

gtag.prototype.dataLayerName = "dataLayer";

export type GTMConsentType =
  | "ad_storage"
  | "ad_user_data"
  | "ad_personalization"
  | "analytics_storage"
  | "functionality_storage"
  | "personalization_storage"
  | "security_storage";

export type GTMCookieOptions = {
  name: string;
  domain?: string;
  expires?: Date;
  path?: string;
};

export type GTMParams = {
  gtmId?: string;
  dataLayerName?: string;
  auth?: string;
  preview?: string;
  nonce?: string;
  cookieOptions?: GTMCookieOptions;
  consentTypes?: Array<GTMConsentType>;
};

type Decision = Partial<Record<GTMConsentType, "granted" | "denied" | undefined>>;
