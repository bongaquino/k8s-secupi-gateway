import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { BookOpen } from "lucide-react";

interface GuidelineProps {
  title: string;
  bestPractices: string[];
  avoid: string[];
}

const guidelines: Record<"interior" | "exterior", GuidelineProps> = {
  exterior: {
    title: "Exterior Image Guidelines",
    bestPractices: [
      "Ensure the **subject (building)** occupies at least **80% of the image** for optimal results.",
      "Include **textures** in elevation views to indicate siding materials, roofing, and other surfaces.",
      "Add **setting elements**, such as drawn-in landscaping, to improve contextual accuracy.",
    ],
    avoid: [
      "Uploading **.gif, .pdf, or other non-image file types** (only .png, .jpeg, or .svg are supported).",
      "Using **zoomed-out perspectives**, which result in poor image generation.",
      "Leaving **blank white spaces on walls** where textures (e.g., siding material) should be defined.",
    ],
  },
  interior: {
    title: "Interior Image Guidelines",
    bestPractices: [
      "Upload files in **.png, .jpeg, or .svg** formats to ensure compatibility and quality.",
      "Ensure the **primary subject** takes up at least **80% of the frame** for clearer, more detailed results.",
      "Provide images with **clear indications of interior textures and materials** where applicable.",
      "Include **scene-setting elements** such as **furniture layouts** and **specific design features** to guide generation.",
    ],
    avoid: [
      "Submitting **.gif, .pdf, or other non-compatible file types**, as they will not be processed correctly.",
      "Using **overly zoomed-out images**, which reduce interior detail accuracy.",
      "Leaving **key areas blank or untextured**, as this impacts the quality of the generated output.",
    ],
  },
};

const GuidelineSection = ({ guideline }: { guideline: GuidelineProps }) => (
  <div className="space-y-6 p-6 bg-slate-50 dark:bg-card rounded-lg">
    <h2 className="text-xl font-semibold text-foreground">{guideline.title}</h2>
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-green-600 dark:text-green-500 flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span> Best Practices
        </h3>
        <ul className="space-y-3">
          {guideline.bestPractices.map((practice: string, index: number) => (
            <li
              key={index}
              className={cn(
                "text-sm leading-relaxed text-foreground/90",
                "before:content-['•'] before:mr-2 before:text-muted-foreground"
              )}
              dangerouslySetInnerHTML={{
                __html: practice.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-semibold">$1</strong>'
                ),
              }}
            />
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-red-600 dark:text-red-500 flex items-center gap-2 mb-3">
          <span className="text-lg">❌</span> Avoid
        </h3>
        <ul className="space-y-3">
          {guideline.avoid.map((item: string, index: number) => (
            <li
              key={index}
              className={cn(
                "text-sm leading-relaxed text-foreground/90",
                "before:content-['•'] before:mr-2 before:text-muted-foreground"
              )}
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="font-semibold">$1</strong>'
                ),
              }}
            />
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export function DesignGuidelinesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border hover:bg-muted-foreground/5 transition-colors "
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:block">User Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] flex flex-col rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Design Guidelines</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2 -mr-2 -mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <GuidelineSection guideline={guidelines.exterior} />
            <GuidelineSection guideline={guidelines.interior} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
