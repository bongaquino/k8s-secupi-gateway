import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  UploadIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HelpCircle,
  X,
  Shuffle,
} from "lucide-react";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import designService from "@/api/design";
import { toast } from "sonner";
import config from "@/config";
import { ApiError } from "@/api/utils/apiError";
import { trackDesign } from "@/lib/analytics";

interface UploadCardProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setResult: (result: {
    inputImageUrl: string;
    resultImageUrl: string;
    status: "starting" | "processing" | "success";
  }) => void;
  result: {
    inputImageUrl: string;
    resultImageUrl: string;
    status: "starting" | "processing" | "success";
  } | null;
  setProcessingTime: (processingTime: number) => void;
}

export default function UploadCard({
  isLoading,
  setIsLoading,
  setResult,
  setProcessingTime,
}: UploadCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [geometry, setGeometry] = useState([config.api.defaultParams.geometry]);
  const [creativity, setCreativity] = useState([
    config.api.defaultParams.creativity,
  ]);
  const [dynamic, setDynamic] = useState([config.api.defaultParams.dynamic]);
  const [sharpen, setSharpen] = useState([config.api.defaultParams.sharpen]);
  const [seed, setSeed] = useState<number>(config.api.defaultParams.seed);
  const [, setRequestId] = useState<string>();
  const [designType, setDesignType] = useState<"interior" | "exterior">(
    "interior"
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > config.upload.maxFileSize) {
        toast.error(
          `File size must be less than ${
            config.upload.maxFileSize / (1024 * 1024)
          }MB`
        );
        return;
      }
      if (!config.upload.allowedMimeTypes.includes(file.type)) {
        toast.error(
          `File type ${
            file.type
          } is not supported. Allowed types: ${config.upload.allowedMimeTypes.join(
            ", "
          )}`
        );
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      trackDesign.requestStarted(designType);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > config.upload.maxFileSize) {
        toast.error(
          `File size must be less than ${
            config.upload.maxFileSize / (1024 * 1024)
          }MB`
        );
        return;
      }
      if (!config.upload.allowedMimeTypes.includes(file.type)) {
        toast.error(
          `File type ${
            file.type
          } is not supported. Allowed types: ${config.upload.allowedMimeTypes.join(
            ", "
          )}`
        );
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleResetImage = () => {
    setImageUrl(null);
    setImageFile(null);
    const input = document.getElementById("imageInput") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(100000 + Math.random() * 900000).toString();
    setSeed(parseInt(randomSeed));
  };

  const handleRandomSeed = () => {
    generateRandomSeed();
    trackDesign.optionsChanged("randomSeed");
  };

  useEffect(() => {
    generateRandomSeed();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessingTime(0);

    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    if (!prompt) {
      toast.error("Please enter a design prompt");
      return;
    }

    try {
      setIsLoading(true);
      const startTime = Date.now();

      trackDesign.requestSubmitted(designType);

      const submitResponse = await designService.submitDesignRequest(
        imageFile,
        prompt,
        {
          geometry: geometry[0],
          creativity: creativity[0],
          dynamic: dynamic[0],
          sharpen: sharpen[0],
          seed,
          designType,
        }
      );

      if (submitResponse && submitResponse.status === "success") {
        setRequestId(submitResponse.id);

        // Start polling for status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await designService.checkDesignStatus(
              submitResponse.id || ""
            );

            setProcessingTime(Math.floor((Date.now() - startTime) / 1000));

            switch (statusResponse.status) {
              case "success": {
                clearInterval(pollInterval);
                setResult({
                  inputImageUrl: imageUrl || "",
                  resultImageUrl: statusResponse.message || "",
                  status: "success",
                });
                setIsLoading(false);
                toast.success(
                  `Successfully generated design in ${Math.floor(
                    (Date.now() - startTime) / 1000
                  )} seconds`
                );
                break;
              }

              case "processing":
                setResult({
                  inputImageUrl: imageUrl || "",
                  resultImageUrl: "",
                  status: "processing",
                });
                break;

              case "starting":
                setResult({
                  inputImageUrl: imageUrl || "",
                  resultImageUrl: "",
                  status: "starting",
                });
                break;

              default:
                clearInterval(pollInterval);
                setIsLoading(false);
                toast.error(
                  `An error occurred while processing your request. Please try again.`
                );
            }
          } catch (error) {
            clearInterval(pollInterval);
            setIsLoading(false);
            if (error instanceof ApiError) {
              toast.error(error.message);
            } else {
              toast.error("Failed to check design status");
              console.error("Error checking status:", error);
            }
          }
        }, 5000);
      } else {
        setIsLoading(false);
        toast.error("Failed to submit design request");
      }
    } catch (error) {
      setIsLoading(false);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to process design request");
        console.error("Error submitting request:", error);
      }
    }
  };

  // Define wrapper functions for tracking option changes
  const handleGeometryChange = (value: number[]) => {
    setGeometry(value);
    trackDesign.optionsChanged("geometry");
  };

  const handleCreativityChange = (value: number[]) => {
    setCreativity(value);
    trackDesign.optionsChanged("creativity");
  };

  const handleDynamicChange = (value: number[]) => {
    setDynamic(value);
    trackDesign.optionsChanged("dynamic");
  };

  const handleSharpenChange = (value: number[]) => {
    setSharpen(value);
    trackDesign.optionsChanged("sharpen");
  };

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSeed(isNaN(value) ? config.api.defaultParams.seed : value);
    trackDesign.optionsChanged("seed");
  };

  const handleDesignTypeChange = (value: string) => {
    setDesignType(value as "interior" | "exterior");
    trackDesign.optionsChanged("designType");
  };

  return (
    <div className="rounded-xl border bg-slate-50 dark:bg-card backdrop-blur-sm shadow-sm">
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Upload Image & Set Prompt</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="rounded-lg border border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors bg-background duration-0 upload-image"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              id="imageInput"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {!imageUrl && (
              <label
                htmlFor="imageInput"
                className="flex flex-col items-center gap-2 py-12 cursor-pointer"
              >
                <UploadIcon className="w-8 h-8 text-slate-400 dark:text-muted-foreground" />
                <p className="text-sm text-slate-400 dark:text-muted-foreground">
                  Drag & Drop or Click to Upload
                </p>
              </label>
            )}
            {imageUrl && (
              <div className="relative">
                <button
                  onClick={handleResetImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full object-fit rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="space-y-2 design-prompt">
            <Label htmlFor="promptInput" className="font-semibold">
              Design Prompt
            </Label>
            <Textarea
              disabled={isLoading}
              id="promptInput"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.substring(0, 500))}
              className="resize-none bg-background"
              placeholder="Transform an existing architectural blueprint into a modern, AI-enhanced design with sleek geometric lines and a vibrant neon finish..."
              rows={4}
              maxLength={500}
            />
            <p
              className={`text-xs text-muted-foreground text-right ${
                prompt.length > 490 ? "text-red-500" : ""
              }`}
            >
              {prompt.length}/500 characters
            </p>
          </div>

          <div className="space-y-4 design-type">
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 font-semibold text-md -mt-4">
                    Design Type
                  </Label>
                </div>
                <Select
                  disabled={isLoading}
                  value={designType || ""}
                  onValueChange={(value) =>
                    handleDesignTypeChange(value as "interior" | "exterior")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a design type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">Interior Design</SelectItem>
                    <SelectItem value="exterior">Exterior Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="py-2 custom-settings">
            <div
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Label className="flex items-center gap-2 font-semibold text-md">
                Customization Settings
              </Label>
              {showAdvanced ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </div>

            {showAdvanced && (
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center mb-2.5">
                      <Label className="text-sm">Geometry</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-2">
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Adjusts focus on geometric shapes. Higher values
                          create angular designs; lower values make them softer.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider
                      disabled={isLoading}
                      value={geometry}
                      onValueChange={handleGeometryChange}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                    <div className="flex justify-between px-[2px] mt-2.5">
                      <span className="text-xs text-slate-500">0</span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.2
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.4
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.6
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.8
                      </span>
                      <span className="text-xs text-slate-500">1</span>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center mb-2.5">
                      <Label className="text-sm">Creativity</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-2">
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Controls AI creativity. Higher values make designs
                          more unique; lower values keep them conventional.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider
                      disabled={isLoading}
                      value={creativity}
                      onValueChange={handleCreativityChange}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                    <div className="flex justify-between px-[2px] mt-2.5">
                      <span className="text-xs text-slate-500">0</span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.2
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.4
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.6
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.8
                      </span>
                      <span className="text-xs text-slate-500">1</span>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center mb-2.5">
                      <Label className="text-sm">Dynamic</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-2">
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Sets design energy. Higher values add movement; lower
                          values keep it static.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider
                      disabled={isLoading}
                      value={dynamic}
                      onValueChange={handleDynamicChange}
                      min={0}
                      max={10}
                      step={1}
                    />
                    <div className="flex justify-between px-[2px] mt-2.5">
                      <span className="text-xs text-slate-500">0</span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        2
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        4
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        6
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        8
                      </span>
                      <span className="text-xs text-slate-500">10</span>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center mb-2.5">
                      <Label className="text-sm">Sharpen</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-2">
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Adjusts detail sharpness. Higher values make it
                          crisper; lower values soften it.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Slider
                      disabled={isLoading}
                      value={sharpen}
                      onValueChange={handleSharpenChange}
                      min={0}
                      max={1}
                      step={0.1}
                    />
                    <div className="flex justify-between px-[2px] mt-2.5">
                      <span className="text-xs text-slate-500">0</span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.2
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.4
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.6
                      </span>
                      <span className="text-xs text-slate-500 -translate-x-[10%]">
                        0.8
                      </span>
                      <span className="text-xs text-slate-500">1</span>
                    </div>
                  </div>

                  <div className="w-full col-span-2 ">
                    <div className="flex items-center mb-2">
                      <Label className="text-sm">Seed</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-2">
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Unique number for design variation. Change it to get a
                          new result with the same settings.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        value={seed.toString()}
                        onChange={handleSeedChange}
                        className="w-full pr-10"
                        placeholder="453463"
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleRandomSeed}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                        type="button"
                      >
                        <Shuffle className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full font-semibold design-button"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : "Process Design"}
          </Button>
        </form>
      </div>
    </div>
  );
}
