"use client";

import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { avatarUrl, JURORS } from "@/lib/jurors";

export function JuryMarquee() {
  // two loops end-to-end gives a seamless marquee
  const row = [...JURORS, ...JURORS];

  return (
    <section id="jury" className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 safe-x">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            meet the jury
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Fifteen personas. Five called per case.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Tap or hover for their vibe. Swipe on mobile.
          </p>
        </div>
      </div>

      <div className="relative mt-10">
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-24" />

        <motion.div
          className="flex w-max gap-4 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        >
          {row.map((juror, i) => (
            <Tooltip key={`${juror.id}-${i}`}>
              <TooltipTrigger asChild>
                <div className="group flex min-w-[180px] shrink-0 flex-col items-center gap-3 rounded-3xl border bg-card p-5 text-center shadow-sm transition-colors hover:bg-accent">
                  <Avatar className="size-20 border">
                    <AvatarImage src={avatarUrl(juror)} alt={juror.name} />
                    <AvatarFallback>{juror.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold leading-tight">{juror.name}</div>
                    <div className="mt-1 flex flex-wrap justify-center gap-1">
                      {juror.modes.map((m) => (
                        <Badge
                          key={m}
                          variant={m === "petty" ? "default" : "secondary"}
                          className="rounded-full px-2 py-0 text-[10px] capitalize"
                        >
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={6} className="max-w-xs text-center">
                <span className="text-sm">{juror.tagline}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
