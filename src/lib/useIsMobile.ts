import { useEffect, useState } from "react";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent;
      const hasTouch = navigator.maxTouchPoints > 1;

      // Basic mobile detection via user agent
      const isPhoneUA = /Mobi|Android|iPhone|iPod/i.test(ua);

      // Tablets sometimes have touch but aren’t phones
      const isTabletUA = /iPad|Tablet/i.test(ua);

      setIsMobile(isPhoneUA || (hasTouch && isTabletUA));
    };

    checkMobile();

    // Optional: listen for orientation/resolution changes
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
