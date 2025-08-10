import { Button } from "@/components/ui/button";
import { Download, Link2, Wand2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ResultCardProps {
  result: {
    inputImageUrl?: string;
    resultImageUrl?: string;
    status: "starting" | "processing" | "success";
  } | null;
  isLoading: boolean;
  processingTime: number;
}

export default function ResultCard({
  result,
  isLoading,
  processingTime,
}: ResultCardProps) {
  const [activeTab, setActiveTab] = useState("side-by-side");
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleCopyUrl = async () => {
    if (result?.resultImageUrl) {
      try {
        await navigator.clipboard.writeText(result.resultImageUrl);
        toast.success("Image URL copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy URL to clipboard");
      }
    } else {
      toast.error("No image URL to copy");
    }
  };

  const handleDownload = async () => {
    if (result?.resultImageUrl) {
      try {
        const response = await fetch(result.resultImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "design-result.png";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Image downloaded successfully");
      } catch (error) {
        toast.error("Failed to download image");
      }
    } else {
      toast.error("No image to download");
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-slate-50 dark:bg-card text-card-foreground backdrop-blur-sm shadow-sm h-fit">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Result</h2>
          <div className="min-h-[500px] flex flex-col items-center gap-4 flex-1 justify-center rounded-lg border  relative overflow-hidden">
            <div className="relative w-28 h-28">
              <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-dashed border-primary/30 rounded-full animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <Wand2 className="w-14 h-14 text-primary animate-wand-wiggle" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-lg text-muted-foreground animate-pulse">
                {result?.status === "starting"
                  ? "Starting design generation..."
                  : result?.status === "processing"
                  ? "Processing your design..."
                  : "Starting design generation..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-slate-50 dark:bg-card text-card-foreground backdrop-blur-sm shadow-sm h-fit result-card">
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Result</h2>
        <div
          className={`min-h-fit  sm:min-h-[500px] flex flex-col rounded-lg ${
            result ? "" : "border"
          }`}
        >
          {!result && (
            <div className="text-center flex flex-col items-center gap-4 flex-1  my-8 mx-4 justify-center text-muted-foreground/75">
              <Wand2 className="w-16 h-16 " />
              <div className="space-y-1">
                <p className="text-base sm:text-lg">
                  The result will appear here after processing.
                </p>
                <p className="text-xs sm:text-sm ">
                  Upload an image and set a prompt to get started.
                </p>
              </div>
            </div>
          )}
          {result && (
            <div className="w-full flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full md:w-fit"
                >
                  <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
                    <TabsTrigger
                      value="before"
                      className="flex-1 data-[state=active]:bg-blue-500"
                    >
                      Before Only
                    </TabsTrigger>
                    <TabsTrigger
                      value="after"
                      className="flex-1 data-[state=active]:bg-blue-500"
                    >
                      After Only
                    </TabsTrigger>
                    <TabsTrigger
                      value="side-by-side"
                      className="flex-1 data-[state=active]:bg-blue-500"
                    >
                      Side-by-Side
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial px-3 flex items-center gap-2 hover:bg-muted-foreground/5 hover:text-accent-foreground transition-colors"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial px-3 flex items-center gap-2 hover:bg-muted-foreground/5 transition-colors"
                    onClick={handleCopyUrl}
                  >
                    <Link2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </Button>
                </div>
              </div>

              <div className="relative aspect-video min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex-1">
                {activeTab === "before" && (
                  <img
                    src={result.inputImageUrl}
                    alt="Before"
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
                {activeTab === "after" && (
                  <img
                    src={result.resultImageUrl}
                    alt="After"
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
                {activeTab === "side-by-side" && (
                  <div className="relative w-full h-full overflow-hidden rounded-lg">
                    <img
                      src={result.resultImageUrl}
                      alt="After"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <img
                      src={result.inputImageUrl}
                      alt="Before"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      style={{
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={handleSliderChange}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize"
                      style={{ zIndex: 10 }}
                    />
                    <div
                      className="absolute top-0 h-full w-1 bg-white shadow-md"
                      style={{ left: `${sliderPosition}%`, zIndex: 5 }}
                    >
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 9l-4-4m0 0l4-4m-4 4h16m-8 6l4 4m0 0l-4 4m4-4H4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-1">
                <div>
                  <p className="text-sm text-muted-foreground/75">
                    Processing Time: {processingTime}s
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
