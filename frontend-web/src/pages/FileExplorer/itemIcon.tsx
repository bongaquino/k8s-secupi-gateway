import { useState } from "react";
import type { FileItem } from "./types";
import { Folder, File } from "lucide-react";

const getItemIcon = (item: FileItem) => {
  if (item.type === "folder") {
    return "/src/assets/icons/FOLDER.svg";
  }

  const extensionMap: { [key: string]: string } = {
    pdf: "/src/assets/icons/PDF.svg",
    jpg: "/src/assets/icons/JPG.svg",
    jpeg: "/src/assets/icons/JPG.svg",
    png: "/src/assets/icons/PNG.svg",
    gif: "/src/assets/icons/GIFF.svg",
    svg: "/src/assets/icons/SVG.svg",
    doc: "/src/assets/icons/DOC.svg",
    docx: "/src/assets/icons/DOCX.svg",
    txt: "/src/assets/icons/TXT.svg",
    html: "/src/assets/icons/HTML.svg",
    css: "/src/assets/icons/CSS.svg",
    js: "/src/assets/icons/JAVA.svg",
    json: "/src/assets/icons/TXT.svg",
    md: "/src/assets/icons/TXT.svg",
    mp3: "/src/assets/icons/MP3.svg",
    mp4: "/src/assets/icons/MP4.svg",
    avi: "/src/assets/icons/AVI.svg",
    zip: "/src/assets/icons/ZIP.svg",
    rar: "/src/assets/icons/RAR.svg",
    exe: "/src/assets/icons/EXE.svg",
    sh: "/src/assets/icons/TXT.svg",
  };

  return (
    extensionMap[item.extension?.toLowerCase() || ""] ||
    "/src/assets/icons/TXT.svg"
  );
};

export const ItemIcon = ({
  item,
  className = "h-6 w-6",
}: {
  item: FileItem;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    if (item.type === "folder") {
      return <Folder className={`${className} text-yellow-500`} />;
    }
    return <File className={`${className} text-gray-500`} />;
  }

  return (
    <img
      src={getItemIcon(item)}
      alt={item.type}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};
