"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function HoverNavItem({
  label,
  href,
  highlighted,
  active,
  menu,
}: {
  label: string;
  href: string;
  highlighted?: boolean;
  active?: boolean;
  menu?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function closeSoon() {
    // Small delay so moving the cursor from the trigger down into the
    // dropdown itself doesn't register as "leaving" and flicker-close it.
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  // Matches navLinkClass() in HeaderNav.tsx: ivory text on the header's
  // dark navy background, champagne on hover/active. (This used to be
  // dark-navy text left over from before the header background was
  // changed to navy — that's what made Rings/Earrings/etc. nearly
  // invisible while Home/Shop/About stayed visible.) Men's Collection
  // adds a subtle underline flourish on top of the same colors.
  const base = `text-ivory/90 font-semibold transition-colors hover:text-champagne ${
    active ? "text-champagne" : ""
  }`;
  const underline = highlighted
    ? " relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 hover:after:w-full after:bg-champagne after:transition-all"
    : "";

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <Link href={href} className={base + underline}>
        {label}
      </Link>
      {menu && open && menu}
    </div>
  );
}
