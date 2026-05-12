"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LiveSupportWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none fixed bottom-5 right-5 z-[120]"
    >
      <Link
        href="/support"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-[#0d1421]/90 px-4 py-3 text-xs font-semibold text-cyan-200 shadow-2xl backdrop-blur-md transition hover:border-cyan-400/45 hover:bg-cyan-400/10"
      >
        💬 Support
      </Link>
    </motion.div>
  );
}
