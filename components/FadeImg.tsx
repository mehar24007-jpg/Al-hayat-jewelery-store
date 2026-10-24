"use client";

import { useEffect, useRef, useState } from "react";

/** An image that sharpens from a soft blur once it has loaded (see img[data-load] in globals.css). */
export default function FadeImg({ onLoad, onError, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [ok, setOk] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setOk(true);
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      {...props}
      alt={props.alt ?? ""}
      data-load={ok ? "1" : "0"}
      onLoad={(e) => {
        setOk(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setOk(true);
        onError?.(e);
      }}
    />
  );
}
