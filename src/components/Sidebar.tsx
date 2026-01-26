import { useState } from "react";
import { Search, Star, BookOpen, HelpCircle, Menu, X } from "lucide-react";
import { Section } from "@/data/sections";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sections: Section[];
  activeId: string | null;
  onSelectSection: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isCompleted: (id: string) => boolean;
}

type FilterType = "all" | "cours" | "quiz" | "favoris";

export function Sidebar({
  sections,
  activeId,
  onSelectSection,
  isFavorite,
  onToggleFavorite,
  isCompleted,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredSections = sections.filter((s) => {
    const matchesSearch =
      !search.trim() ||
      `${s.title} ${s.desc} ${s.subject}`.toLowerCase().includes(search.toLowerCase());

    let matchesFilter = true;
    if (filter === "cours") matchesFilter = s.tags.includes("cours");
    if (filter === "quiz") matchesFilter = s.tags.includes("quiz");
    if (filter === "favoris") matchesFilter = isFavorite(s.id);

    return matchesSearch && matchesFilter;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "cours", label: "Cours" },
    { key: "quiz", label: "Quiz" },
    { key: "favoris", label: "⭐ Favoris" },
  ];

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-gradient-to-b from-white/[0.06] to-white/[0.03] shadow-lg">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-black text-sm text-white shadow-lg">
          SL
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">StudyLaw</h1>
          <p className="text-xs text-muted-foreground">Cours organisés + quiz</p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-3.5 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border/50 bg-white/[0.04] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Filter pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "text-xs px-3 py-2 rounded-full border transition-all duration-150",
              filter === f.key
                ? "border-primary/50 bg-primary/20 text-primary-foreground"
                : "border-border/50 bg-white/[0.04] text-muted-foreground hover:text-foreground hover:-translate-y-0.5"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Navigation items */}
      <nav className="mt-4 flex flex-col gap-2 overflow-auto custom-scrollbar flex-1 pr-1">
        {filteredSections.length === 0 ? (
          <div className="p-3 rounded-2xl border border-border/50 bg-white/[0.03]">
            <p className="text-sm font-medium">Aucun résultat</p>
            <p className="text-xs text-muted-foreground mt-1">Change ta recherche/filtre</p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const done = isCompleted(section.id);
            const fav = isFavorite(section.id);

            return (
              <div
                key={section.id}
                onClick={() => {
                  onSelectSection(section.id);
                  setMobileOpen(false);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onToggleFavorite(section.id);
                }}
                className={cn(
                  "p-3 rounded-2xl border cursor-pointer transition-all duration-150 group",
                  activeId === section.id
                    ? "border-primary/50 bg-gradient-to-b from-primary/20 to-white/[0.03]"
                    : "border-border/50 bg-white/[0.03] hover:bg-white/[0.05] hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold truncate">
                      {section.title} {done && "✅"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {section.subject} • {section.quiz.length} quiz
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(section.id);
                    }}
                    className={cn(
                      "flex-shrink-0 transition-opacity",
                      fav ? "opacity-100" : "opacity-40 group-hover:opacity-70"
                    )}
                  >
                    <Star className={cn("w-4 h-4", fav && "fill-amber-400 text-amber-400")} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </nav>

      {/* Footer tip */}
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        💡 Astuce : clique une section → lis l'essentiel en surligné → fais le quiz → sauvegarde tes progrès.
      </p>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-80 p-4 flex flex-col glass-panel z-50 transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {sidebarContent}
      </aside>
    </>
  );
}
