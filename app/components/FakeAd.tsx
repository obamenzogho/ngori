'use client';

/**
 * Élément "appât" supplémentaire - ressemble à une vraie pub
 * Les adblockers vont tenter de le masquer
 */
export default function FakeAd() {
  return (
    <div
      id="google-ad-container"
      className="adsbygoogle ad-wrapper google-ads advertisement"
      data-ad-client="ca-pub-fake"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
