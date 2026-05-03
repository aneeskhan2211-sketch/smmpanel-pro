import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type Language,
  type TranslationKey,
  translations,
} from "@/i18n/translations";
import { Download, Globe, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const LANGUAGES: { code: Language; label: string; dir?: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "hinglish", label: "Hinglish" },
  { code: "ar", label: "Arabic", dir: "rtl" },
];

const KEY_PREFIXES = [
  "all",
  "nav",
  "dashboard",
  "order",
  "payment",
  "service",
  "support",
  "common",
] as const;
type KeyPrefix = (typeof KEY_PREFIXES)[number];

type TranslationOverrides = Partial<Record<TranslationKey, string>>;

export function AdminTranslationsPage() {
  const [activeLang, setActiveLang] = useState<Language>("hi");
  const [search, setSearch] = useState("");
  const [prefixFilter, setPrefixFilter] = useState<KeyPrefix>("all");
  const [rtlPreview, setRtlPreview] = useState(false);
  const [overrides, setOverrides] = useState<
    Record<Language, TranslationOverrides>
  >({
    en: {},
    hi: {},
    hinglish: {},
    ar: {},
  });
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allKeys = Object.keys(translations.en) as TranslationKey[];

  const filteredKeys = allKeys.filter((key) => {
    const matchPrefix =
      prefixFilter === "all" || key.startsWith(`${prefixFilter}.`);
    const matchSearch =
      !search ||
      key.toLowerCase().includes(search.toLowerCase()) ||
      translations.en[key].toLowerCase().includes(search.toLowerCase());
    return matchPrefix && matchSearch;
  });

  function getTranslation(lang: Language, key: TranslationKey): string {
    return (
      overrides[lang][key] ?? translations[lang]?.[key] ?? translations.en[key]
    );
  }

  function isUntranslated(key: TranslationKey): boolean {
    if (activeLang === "en") return false;
    const val = overrides[activeLang][key] ?? translations[activeLang]?.[key];
    return !val || val === translations.en[key];
  }

  function handleEdit(key: TranslationKey, value: string) {
    setOverrides((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [key]: value },
    }));
    setDirty(true);
  }

  function handleSaveAll() {
    // In a real app, persist to backend
    toast.success(
      `Translations saved for ${LANGUAGES.find((l) => l.code === activeLang)?.label}`,
    );
    setDirty(false);
  }

  function handleExport() {
    const out: Record<string, string> = {};
    for (const key of allKeys) {
      out[key] = getTranslation(activeLang, key);
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations_${activeLang}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${activeLang} translations`);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<
          string,
          string
        >;
        const patch: TranslationOverrides = {};
        for (const key of allKeys) {
          if (data[key]) patch[key] = data[key];
        }
        setOverrides((prev) => ({
          ...prev,
          [activeLang]: { ...prev[activeLang], ...patch },
        }));
        setDirty(true);
        toast.success(
          `Imported ${Object.keys(patch).length} keys for ${activeLang}`,
        );
      } catch {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const activeDir = rtlPreview && activeLang === "ar" ? "rtl" : "ltr";
  const untranslatedCount =
    activeLang !== "en" ? allKeys.filter(isUntranslated).length : 0;

  return (
    <div className="p-6 space-y-6" data-ocid="admin.translations.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Translation Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage UI translations across English, Hindi, Hinglish, and Arabic.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeLang === l.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              data-ocid={`admin.translations.lang_${l.code}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <Input
            placeholder="Search keys or values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
            data-ocid="admin.translations.search_input"
          />
          {/* Prefix filter */}
          <select
            value={prefixFilter}
            onChange={(e) => setPrefixFilter(e.target.value as KeyPrefix)}
            className="h-9 rounded-md border border-input bg-background text-sm px-2 text-foreground"
            data-ocid="admin.translations.prefix_select"
          >
            {KEY_PREFIXES.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All categories" : `${p}.*`}
              </option>
            ))}
          </select>
          {/* RTL preview (Arabic only) */}
          {activeLang === "ar" && (
            <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={rtlPreview}
                onChange={(e) => setRtlPreview(e.target.checked)}
                className="accent-primary h-4 w-4"
                data-ocid="admin.translations.rtl_toggle"
              />
              RTL Preview
            </label>
          )}
          {untranslatedCount > 0 && (
            <Badge className="bg-warning/20 text-warning">
              {untranslatedCount} untranslated
            </Badge>
          )}
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="admin.translations.import_button"
          >
            <Upload className="h-4 w-4 mr-1" /> Import JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            data-ocid="admin.translations.export_button"
          >
            <Download className="h-4 w-4 mr-1" /> Export JSON
          </Button>
          <Button
            size="sm"
            disabled={!dirty}
            onClick={handleSaveAll}
            data-ocid="admin.translations.save_button"
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border border-border bg-card overflow-hidden"
        dir={activeDir}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-56">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-64">
                  English (Reference)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {LANGUAGES.find((l) => l.code === activeLang)?.label}{" "}
                  Translation
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-12 text-center text-muted-foreground"
                    data-ocid="admin.translations.empty_state"
                  >
                    No keys match your filters.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key, i) => {
                  const untranslated = isUntranslated(key);
                  const currentVal = getTranslation(activeLang, key);
                  return (
                    <tr
                      key={key}
                      className="border-t border-border hover:bg-muted/10 transition-colors"
                      data-ocid={`admin.translations.row.${i + 1}`}
                    >
                      <td className="px-4 py-2 font-mono text-xs text-primary align-top pt-3">
                        {key}
                        {untranslated && (
                          <Badge className="ml-2 bg-warning/20 text-warning text-[10px] py-0">
                            Missing
                          </Badge>
                        )}
                      </td>
                      <td
                        className="px-4 py-2 text-muted-foreground text-xs max-w-xs align-top pt-3"
                        dir="ltr"
                      >
                        {translations.en[key]}
                      </td>
                      <td className="px-4 py-2 align-top">
                        {activeLang === "en" ? (
                          <span className="text-muted-foreground text-xs">
                            {translations.en[key]}
                          </span>
                        ) : (
                          <Input
                            value={currentVal}
                            onChange={(e) => handleEdit(key, e.target.value)}
                            className={`h-8 text-xs ${
                              untranslated
                                ? "border-warning/50 focus:border-warning"
                                : ""
                            }`}
                            dir={activeLang === "ar" ? "rtl" : "ltr"}
                            data-ocid={`admin.translations.input.${i + 1}`}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredKeys.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
            <span>
              Showing {filteredKeys.length} of {allKeys.length} keys
            </span>
            {dirty && (
              <span className="text-warning font-medium">Unsaved changes</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
