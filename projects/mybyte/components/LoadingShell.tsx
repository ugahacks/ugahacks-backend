import React, { useEffect, useState } from "react";

const OUTAGE_EMAIL = "hello@ugahacks.com";

const buildOutageMailto = (details: string) =>
  `mailto:${OUTAGE_EMAIL}?subject=${encodeURIComponent(
    "MyByte outage report"
  )}&body=${encodeURIComponent(
    "Hi UGAHacks team,\n\nMyByte isn't loading for me.\n\n" +
      details +
      "What I was trying to do:\n\n"
  )}`;

/**
 * Shown while auth state resolves. The report link fades in after a delay
 * (CSS-only, so it still appears if JavaScript stalls) to avoid flashing it
 * on normal loads.
 */
const LoadingShell = () => {
  const [mailto, setMailto] = useState(buildOutageMailto(""));

  // Page URL and browser details are only available on the client.
  useEffect(() => {
    setMailto(
      buildOutageMailto(
        `Page: ${window.location.href}\n` +
          `Time: ${new Date().toString()}\n` +
          `Browser: ${navigator.userAgent}\n\n`
      )
    );
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-white font-inter"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
      <span className="sr-only">Loading MyByte</span>
      <a
        href={mailto}
        className="animate-delayed-reveal flex items-center gap-1 text-sm text-gray-600 underline-offset-4 hover:text-primary-600 hover:underline"
      >
        Page not loading? Report an outage
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 0 1 .75-.75h10.638l-3.96-3.96a.75.75 0 1 1 1.061-1.06l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.96-3.96H3.75A.75.75 0 0 1 3 10Z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </div>
  );
};

export default LoadingShell;
