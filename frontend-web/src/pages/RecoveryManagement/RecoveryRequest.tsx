import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import "react-datepicker/dist/react-datepicker.css";

interface RecoveryRequestFormProps {
  onSubmit: (data: {
    scope: "full" | "latest" | "time-based";
    path: string;
    recoveryDate?: Date;
  }) => void;
  onCancel: () => void;
}

const RecoveryRequest = ({ onSubmit, onCancel }: RecoveryRequestFormProps) => {
  const [scope, setScope] = useState<"full" | "latest" | "time-based">(
    "latest"
  );
  const [path] = useState("");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleSubmit = () => {
    if (!path) {
      // TODO: Show error message
      return;
    }

    onSubmit({
      scope,
      path,
      ...(scope === "time-based" && {
        recoveryDate: new Date(endDate) || undefined,
      }),
    });
  };

  return (
    <div className="space-y-6 " onClick={(e) => e.stopPropagation()}>
      <div className="space-y-4">
        <Label className="text-base font-semibold">Recovery Scope</Label>
        <RadioGroup
          value={scope}
          onValueChange={(value: "full" | "latest" | "time-based") =>
            setScope(value)
          }
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="full" />
            <Label htmlFor="full" className="font-normal">
              Full Recovery
              <p className="text-sm text-muted-foreground">
                (Recover all files from the last backup)
              </p>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="latest" id="latest" />
            <Label htmlFor="latest" className="font-normal">
              Latest Version
              <p className="text-sm text-muted-foreground">
                (Recover the most recent version of files)
              </p>
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="time-based" id="time-based" />
            <Label htmlFor="time-based" className="font-normal">
              Point in Time
              <p className="text-sm text-muted-foreground">
                (Recover files from a specific date and time)
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {scope === "time-based" && (
        <div className="space-y-2">
          <Label className="text-base font-semibold">Recovery Date</Label>
          <div className="flex items-center gap-2 col-span-2">
            <div>
              <div className="relative">
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="cursor-pointer"
                  onClick={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.showPicker();
                  }}
                />
              </div>
            </div>
            <span className="text-muted-foreground self-end mb-2">-</span>

            <div className="relative">
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="cursor-pointer"
                onClick={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.showPicker();
                }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Select the point in time to recover from
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-5 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={scope === "time-based" && !endDate}
        >
          Create Recovery Request
        </Button>
      </div>
    </div>
  );
};

export default RecoveryRequest;
