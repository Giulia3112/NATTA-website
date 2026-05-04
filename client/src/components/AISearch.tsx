import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, ExternalLink, ChevronDown, ChevronUp, Globe, X, Calendar, MapPin, DollarSign } from "lucide-react";

interface WebSnippet {
  title: string;
  url: string;
  content: string;
}

interface AiMatch {
  id: number;
  title: string;
  organizer: string;
  opportunityType: string;
  stage: string;
  regions: string[];
  fields: string[];
  funding: string;
  fee: string;
  mode: string;
  deadline: string | null;
  description: string | null;
  applicationLink: string | null;
  aiReason: string;
  webSnippets?: WebSnippet[];
}

interface AiResult {
  matches: AiMatch[];
  summary: string;
  webSearched: boolean;
}

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [expandedWeb, setExpandedWeb] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const searchMutation = trpc.opportunities.aiSearch.useMutation({
    onSuccess: (data) => setResult(data as AiResult),
  });

  const handleSearch = () => {
    if (!query.trim() || query.trim().length < 3) return;
    setResult(null);
    setExpandedCards(new Set());
    setExpandedWeb(new Set());
    searchMutation.mutate({ query: query.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const toggleCard = (id: number) =>
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleWeb = (id: number) =>
    setExpandedWeb((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clear = () => {
    setQuery("");
    setResult(null);
    searchMutation.reset();
  };

  return (
    <div className="mb-8">
      {/* Search Box */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="text-white font-semibold text-lg">Busca por IA</span>
          <span className="text-blue-200 text-sm ml-1">— descreva o que você procura</span>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ex: Quero uma bolsa de pesquisa em IA para pós-graduação na Europa, sem taxa..."
            className="w-full px-4 py-3 pr-12 rounded-xl border-0 bg-white/95 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 text-sm leading-relaxed"
          />
          {query && (
            <button
              onClick={clear}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-blue-200 text-xs">
            Enter para buscar · Shift+Enter para nova linha
          </p>
          <Button
            onClick={handleSearch}
            disabled={searchMutation.isPending || query.trim().length < 3}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-5 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
          >
            {searchMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {searchMutation.isPending && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">A IA está analisando {" "}
              <span className="text-blue-600">todas as oportunidades</span>...
            </p>
            <p className="text-gray-400 text-sm">Tenha um pouco de paciência, estamos pareando as oportunidades da NATTA com seus dados na web.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {searchMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-1">
          <p className="font-semibold">Erro ao processar a busca</p>
          <p className="text-red-600">{searchMutation.error?.message ?? "Erro desconhecido."}</p>
        </div>
      )}

      {/* Results */}
      {result && !searchMutation.isPending && (
        <div className="mt-6 space-y-4">
          {/* Summary Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-blue-900 text-sm leading-relaxed">{result.summary}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-blue-600">
                <span>{result.matches.length} oportunidade{result.matches.length !== 1 ? "s" : ""} encontrada{result.matches.length !== 1 ? "s" : ""}</span>
                {result.webSearched && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Enriquecido com busca web
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={clear} className="text-blue-400 hover:text-blue-600 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Match Cards */}
          {result.matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma oportunidade encontrada para esta busca. Tente descrever de outra forma.
            </div>
          ) : (
            result.matches.map((match, idx) => (
              <div
                key={match.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{match.title}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">{match.organizer}</p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {match.opportunityType}
                    </span>
                  </div>

                  {/* AI Reason */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-sm leading-snug">{match.aiReason}</p>
                  </div>

                  {/* Key Details */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {match.deadline ? new Date(match.deadline).toLocaleDateString("pt-BR") : "Prazo contínuo"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {match.mode} · {match.regions.slice(0, 2).join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                      {match.funding} · {match.fee}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{match.stage}</span>
                  </div>

                  {/* Description + Read more */}
                  {match.description && (
                    <div className="mb-3">
                      <p className={`text-gray-600 text-sm leading-relaxed ${!expandedCards.has(match.id) ? "line-clamp-2" : ""}`}>
                        {match.description}
                      </p>
                      {match.description.length > 150 && (
                        <button
                          onClick={() => toggleCard(match.id)}
                          className="text-blue-600 text-xs font-medium mt-1 hover:text-blue-700 flex items-center gap-0.5"
                        >
                          {expandedCards.has(match.id) ? <><ChevronUp className="w-3 h-3" /> Ler menos</> : <><ChevronDown className="w-3 h-3" /> Ler mais</>}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Fields Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {match.fields.slice(0, 4).map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{f}</span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {match.applicationLink ? (
                      <a href={match.applicationLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg flex items-center justify-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Visitar Site
                        </Button>
                      </a>
                    ) : (
                      <Button disabled className="flex-1 bg-gray-100 text-gray-400 text-sm rounded-lg cursor-not-allowed">
                        Link indisponível
                      </Button>
                    )}
                  </div>
                </div>

                {/* Web Snippets */}
                {match.webSnippets && match.webSnippets.length > 0 && (
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => toggleWeb(match.id)}
                      className="w-full px-5 py-2.5 flex items-center gap-2 text-xs text-gray-500 hover:bg-gray-50 transition"
                    >
                      <Globe className="w-3.5 h-3.5 text-green-500" />
                      <span className="font-medium text-gray-600">
                        {expandedWeb.has(match.id) ? "Ocultar" : "Ver"} resultados da web ({match.webSnippets.length})
                      </span>
                      {expandedWeb.has(match.id) ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                    </button>

                    {expandedWeb.has(match.id) && (
                      <div className="px-5 pb-4 space-y-3">
                        {match.webSnippets.map((snippet, i) => (
                          <a
                            key={i}
                            href={snippet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-3 transition"
                          >
                            <p className="text-green-800 font-medium text-xs mb-1 line-clamp-1">{snippet.title}</p>
                            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{snippet.content}</p>
                            <p className="text-green-600 text-xs mt-1 truncate">{snippet.url}</p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
