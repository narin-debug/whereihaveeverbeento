declare global {
  interface Window {
    naver: any;
  }
}

let loadPromise: Promise<void> | null = null;

// Loaded on demand (only by components that render a Korea-focused map)
// rather than globally, since most pages never need it.
export function loadNaverMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadNaverMaps can only run in the browser"));
  }
  if (window.naver?.maps?.Service) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_MAPS_CLIENT_ID;
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.onload = () => {
      // The geocoder submodule loads via its own script tag injected after
      // maps.js runs, so naver.maps.Service isn't attached the instant this
      // onload fires -- poll briefly for it instead of racing it.
      const deadline = Date.now() + 5000;
      const check = () => {
        if (window.naver?.maps?.Service) {
          resolve();
        } else if (Date.now() > deadline) {
          reject(new Error("Naver Maps geocoder submodule did not become ready"));
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    };
    script.onerror = () => reject(new Error("Failed to load the Naver Maps script"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
