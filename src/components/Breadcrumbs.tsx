import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors",
                "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                index === 0 && "pl-1"
              )}
            >
              {index === 0 && <Home className="w-3.5 h-3.5" />}
              <span className="max-w-[120px] truncate">{item.label}</span>
            </button>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-foreground font-medium",
                "max-w-[150px] truncate"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
