import type { Party } from "@/types/game-types";

interface InvestigationResultProps {
  targetName: string;
  party: Party;
  investigatedAt: number;
}

export function InvestigationResult({
  targetName,
  party,
  investigatedAt,
}: InvestigationResultProps) {
  const isLiberal = party === "LIBERAL";
  const date = new Date(investigatedAt);
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border-4 border-noir-black bg-white p-6 shadow-2xl dark:bg-card dark:border-white/20">
      <div className="text-center mb-6">
        <h2 className="font-special-elite text-2xl text-liberal-blue mb-2 dark:text-blue-300">
          INVESTIGATION COMPLETE
        </h2>
        <p className="font-courier text-sm text-noir-black/70 dark:text-white/70">
          Your agents have gathered intelligence on the suspect
        </p>
      </div>

      <div
        className={`
          border-4 p-6 rounded-lg text-center mb-6
          ${
            isLiberal
              ? "border-liberal-blue bg-liberal-blue/10"
              : "border-fascist-red bg-fascist-red/10"
          }
        `}
      >
        <div
          className={`
            w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4
            ${isLiberal ? "bg-liberal-blue" : "bg-fascist-red"}
          `}
        >
          {targetName.slice(0, 2).toUpperCase()}
        </div>

        <h3 className="font-bold text-xl mb-2 dark:text-white">{targetName}</h3>

        <div
          className={`
            inline-block px-6 py-2 rounded-full font-bold text-lg border-2 border-noir-black
            ${isLiberal ? "bg-liberal-blue text-white" : "bg-fascist-red text-white"}
          `}
        >
          {isLiberal ? "LIBERAL PARTY" : "FASCIST PARTY"}
        </div>
      </div>

      <div className="p-4 border-2 border-noir-black/20 bg-vintage-cream rounded-lg dark:bg-card-foreground/5 dark:border-white/20">
        <p className="font-courier text-xs text-noir-black/70 text-center dark:text-white/70">
          CONFIDENTIAL - For your eyes only
          <br />
          Investigated at {timeString}
        </p>
      </div>
    </div>
  );
}
