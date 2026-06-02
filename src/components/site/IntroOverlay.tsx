import { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";

const SESSION_KEY = "medclub.intro.shown.v1";

export function IntroOverlay() {
  const { site } = useStore();
  const [stage, setStage] = useState<"hidden" | "in" | "out">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setStage("in");
    const outTimer = setTimeout(() => setStage("out"), 3200);
    const doneTimer = setTimeout(() => setStage("hidden"), 4400);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (stage === "hidden") return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-[900ms] ease-out ${
        stage === "out" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 45%, rgba(255,255,255,0.75) 80%, rgba(255,255,255,0.5) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="flex flex-col items-center gap-5 px-6 text-center"
        style={{
          animation: "introFadeUp 1100ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <div className="flex items-center gap-4">
          {site.logoUrl ? (
            <img
              src={site.logoUrl}
              alt=""
              className="h-12 w-12 rounded-lg object-cover md:h-14 md:w-14"
            />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground md:h-14 md:w-14">
              <span className="text-2xl font-bold">+</span>
            </span>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Medical Club Store
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground md:text-base">
          <span>powered by</span>
          {site.poweredByLogoUrl ? (
            <img
              src={site.poweredByLogoUrl}
              alt="Powered by"
              className="h-10 w-auto max-w-[200px] object-contain md:h-12"
            />
          ) : (
            <span className="text-base font-medium text-foreground md:text-lg">Your Partner</span>
          )}
        </div>
      </div>
      <style>{`
        @keyframes introFadeUp {
          0% { opacity: 0; transform: translateY(8px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}