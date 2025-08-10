import { Circle } from "lucide-react";

export const renderImportanceBadge = (importance?: string) => {
  const getImportanceStyles = (importance?: string) => {
    switch (importance) {
      case "HIGH":
        return {
          color: "text-red-500",
          background: "bg-red-500",
          label: "Critical",
        };
      case "LOW":
        return {
          color: "text-gray-400",
          background: "bg-gray-400",
          label: "Low",
        };
      default:
        return {
          color: "text-green-500",
          background: "bg-green-500",
          label: "General",
        };
    }
  };

  const styles = getImportanceStyles(importance);

  return (
    <div className="flex items-center">
      <Circle
        className={`h-3 w-3 mr-2 rounded-full ${styles.color} ${styles.background}`}
        fill="currentColor"
      />
      <span>{styles.label}</span>
    </div>
  );
};
