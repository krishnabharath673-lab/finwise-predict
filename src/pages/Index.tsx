import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Eye,
  Flame,
  Forklift,
  Globe,
  Languages,
  Loader2,
  MapPin,
  Moon,
  Search,
  Sparkles,
  Star,
  SunMedium,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GitHubUser = {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  html_url: string;
  type: string;
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string;
  updated_at: string;
  topics: string[];
  html_url: string;
  default_branch: string;
  has_issues: boolean;
};

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
    url: string;
  };
  actor: {
    login: string;
    avatar_url: string;
  };
  payload: {
    ref?: string;
    ref_type?: string;
    action?: string;
    commits?: Array<{ message: string }>;
    issue?: { number: number; title: string };
    pull_request?: { number: number; title: string };
    release?: { tag_name?: string; name?: string };
    master_branch?: string;
    description?: string;
    push_id?: number;
    head?: string;
    before?: string;
    comment?: { body?: string };
    forkee?: { full_name?: string };
  };
};

type ErrorState = {
  message: string;
  kind: "user" | "rate-limit" | "generic";
};

const DEFAULT_USER = "torvalds";
const QUOTE_COLOR_PALETTE = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#a78bfa",
  "#fb7185",
  "#2dd4bf",
  "#f59e0b",
];

const fetchJson = async <T>(url: string, token?: string): Promise<T> => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const response = await fetch(url, { headers });

  if (response.status === 403) {
    throw new Error("GitHub API rate limit exceeded. Add a personal access token or wait a bit and try again.");
  }

  if (response.status === 404) {
    throw new Error("User not found.");
  }

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: value >= 1000 ? "compact" : "standard" }).format(value);

const formatRelativeTime = (date: string) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMs / 3600000);
  if (Math.abs(diffHours) < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffMs / 86400000);
  if (Math.abs(diffDays) < 30) return `${diffDays}d ago`;

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears}y ago`;
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

const buildContributionGrid = (events: GitHubEvent[]) => {
  const dayCount = 52 * 7;
  const counts = new Map<string, number>();

  events.forEach((event) => {
    if (event.type !== "PushEvent") return;
    const dayKey = new Date(event.created_at).toISOString().slice(0, 10);
    counts.set(dayKey, (counts.get(dayKey) ?? 0) + (event.payload.commits?.length ?? 1));
  });

  const start = new Date();
  start.setDate(start.getDate() - dayCount + 1);

  const cells = [] as Array<{ date: Date; count: number; intensity: number }>;
  for (let i = 0; i < dayCount; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const count = counts.get(key) ?? 0;
    const intensity = count === 0 ? 0 : Math.min(4, Math.ceil(count / 2));
    cells.push({ date, count, intensity });
  }

  return cells;
};

const getEventSummary = (event: GitHubEvent) => {
  switch (event.type) {
    case "PushEvent": {
      const commits = event.payload.commits ?? [];
      const message = commits[0]?.message ?? "Pushed code";
      return { title: message, details: `${event.repo.name}` };
    }
    case "PullRequestEvent": {
      const pr = event.payload.pull_request;
      return {
        title: `PR #${pr?.number ?? ""} ${pr?.title ?? "updated"}`,
        details: `${event.repo.name}`,
      };
    }
    case "IssuesEvent": {
      const issue = event.payload.issue;
      return {
        title: `Issue #${issue?.number ?? ""} ${issue?.title ?? "updated"}`,
        details: `${event.repo.name}`,
      };
    }
    case "ReleaseEvent": {
      const release = event.payload.release;
      return {
        title: `Released ${release?.tag_name ?? release?.name ?? "new version"}`,
        details: `${event.repo.name}`,
      };
    }
    case "CreateEvent": {
      return {
        title: `Created ${event.payload.ref_type ?? "branch"} ${event.payload.ref ?? ""}`.trim(),
        details: `${event.repo.name}`,
      };
    }
    case "WatchEvent": {
      return { title: "Starred a repository", details: `${event.repo.name}` };
    }
    case "ForkEvent": {
      return { title: "Forked a repository", details: `${event.payload.forkee?.full_name ?? event.repo.name}` };
    }
    default:
      return { title: event.type.replace(/Event$/, ""), details: `${event.repo.name}` };
  }
};

const getRepoLanguageBreakdown = (repos: GitHubRepo[]) => {
  const map = new Map<string, number>();
  repos.forEach((repo) => {
    if (!repo.language) return;
    map.set(repo.language, (map.get(repo.language) ?? 0) + 1);
  });

  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
};

const getRepoStarsChart = (repos: GitHubRepo[]) =>
  [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map((repo) => ({
      name: repo.name.length > 12 ? `${repo.name.slice(0, 12)}…` : repo.name,
      stars: repo.stargazers_count,
    }));

const DEFAULT_RECENT_SEARCHES = ["torvalds", "vercel", "microsoft", "facebook", "github"];

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, setTheme } = useTheme();

  const [token, setToken] = useState<string>("");
  const [searchInput, setSearchInput] = useState(DEFAULT_USER);
  const [profile, setProfile] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [readmeHtml, setReadmeHtml] = useState("");
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("stars");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [repoSearch, setRepoSearch] = useState("");

  useEffect(() => {
    const storedHistory = localStorage.getItem("gh-profile-history");
    const storedToken = localStorage.getItem("gh-profile-token");
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch {
        setHistory([]);
      }
    }
    if (storedToken) setToken(storedToken);

    const userParam = searchParams.get("user") ?? DEFAULT_USER;
    setSearchInput(userParam);
    void executeSearch(userParam, storedToken ?? "");
  }, []);

  useEffect(() => {
    localStorage.setItem("gh-profile-token", token);
  }, [token]);

  const activeUser = profile?.login ?? searchInput;

  const contributionGrid = useMemo(() => buildContributionGrid(events), [events]);
  const languageBreakdown = useMemo(() => getRepoLanguageBreakdown(repos), [repos]);
  const starsChart = useMemo(() => getRepoStarsChart(repos), [repos]);

  const repoLanguages = useMemo(() => {
    const values = new Set<string>();
    repos.forEach((repo) => {
      if (repo.language) values.add(repo.language);
    });
    return ["all", ...[...values]];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    const normalizedQuery = repoSearch.trim().toLowerCase();
    const result = repos.filter((repo) => {
      const textMatch =
        !normalizedQuery ||
        repo.name.toLowerCase().includes(normalizedQuery) ||
        (repo.description ?? "").toLowerCase().includes(normalizedQuery) ||
        repo.topics.join(" ").toLowerCase().includes(normalizedQuery);

      const languageMatch = languageFilter === "all" || repo.language === languageFilter;
      return textMatch && languageMatch;
    });

    return [...result].sort((a, b) => {
      if (sortKey === "updated") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return b.stargazers_count - a.stargazers_count;
    });
  }, [languageFilter, repoSearch, repos, sortKey]);

  const profileStats = useMemo(() => {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const totalWatchers = repos.reduce((sum, repo) => sum + repo.watchers_count, 0);
    const totalOpenIssues = repos.reduce((sum, repo) => sum + repo.open_issues_count, 0);
    const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);

    return { totalStars, totalForks, totalWatchers, totalOpenIssues, topRepos };
  }, [repos]);

  const addRecentSearch = (value: string) => {
    const next = [value, ...history.filter((item) => item !== value)].slice(0, 6);
    setHistory(next);
    localStorage.setItem("gh-profile-history", JSON.stringify(next));
  };

  const openSelectedRepo = async (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setReadmeLoading(true);
    setReadmeHtml("");

    try {
      const data = await fetchJson<{ html_url: string; download_url: string; content?: string; }>(
        `https://api.github.com/repos/${repo.full_name}/readme`,
        token,
      );

      if (data.download_url) {
        const raw = await fetch(data.download_url);
        const markdown = await raw.text();
        setReadmeHtml(markdown);
      } else {
        setReadmeHtml(`# ${repo.name}\n\nNo README found in the repository.`);
      }
    } catch {
      setReadmeHtml(`# ${repo.name}\n\nNo README content is available for this repository.`);
    } finally {
      setReadmeLoading(false);
    }
  };

  const executeSearch = async (username: string, suppliedToken?: string) => {
    const normalized = username.trim();
    if (!normalized) {
      setError({ message: "Please enter a GitHub username.", kind: "user" });
      return;
    }

    setLoading(true);
    setError(null);
    setSearchInput(normalized);
    setRepoSearch("");
    setLanguageFilter("all");
    setSortKey("stars");
    setSearchParams({ user: normalized });
    addRecentSearch(normalized);

    try {
      const apiToken = suppliedToken ?? token;
      const [profileData, repoData, eventsData] = await Promise.all([
        fetchJson<GitHubUser>(`https://api.github.com/users/${normalized}`, apiToken),
        fetchJson<GitHubRepo[]>(`https://api.github.com/users/${normalized}/repos?per_page=100&sort=updated`, apiToken),
        fetchJson<GitHubEvent[]>(`https://api.github.com/users/${normalized}/events/public?per_page=30`, apiToken),
      ]);

      setProfile(profileData);
      setRepos(repoData);
      setEvents(eventsData);
      setSelectedRepo(null);
    } catch (errorInstance) {
      const message = errorInstance instanceof Error ? errorInstance.message : "Something unexpected happened.";
      setError({
        message,
        kind: message.toLowerCase().includes("rate limit") ? "rate-limit" : "user",
      });
      setProfile(null);
      setRepos([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void executeSearch(searchInput);
  };

  const renderHeader = () => (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">GitHub Explorer</p>
          <h1 className="text-2xl font-bold">Developer profile insights</h1>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full min-w-[220px] md:w-[290px]">
            <form onSubmit={onSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search GitHub user"
                  className="pl-9"
                  aria-label="GitHub username"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="GitHub token (optional)"
              className="w-full md:w-[210px]"
              aria-label="GitHub token"
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle dark mode"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {renderHeader()}
        <main className="mx-auto max-w-7xl space-y-6 p-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_2fr]">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-44" />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {renderHeader()}
        <main className="mx-auto max-w-3xl p-4 py-10">
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {error.kind === "rate-limit" ? "API rate limit reached" : "User lookup failed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground/90">
              <p>{error.message}</p>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_RECENT_SEARCHES.map((item) => (
                  <Button key={item} type="button" variant="outline" size="sm" onClick={() => void executeSearch(item)}>
                    {item}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {renderHeader()}

      <main className="mx-auto max-w-7xl space-y-8 p-4 py-6 md:p-6">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_2.3fr]">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                  <AvatarImage src={profile.avatar_url} alt={`${profile.login} avatar`} />
                  <AvatarFallback>{profile.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{profile.name ?? profile.login}</h2>
                  <p className="text-sm text-muted-foreground">@{profile.login}</p>
                </div>
              </div>

              <p className="text-sm leading-6 text-foreground/80">{profile.bio ?? "No public bio provided."}</p>

              <div className="space-y-2 text-sm text-foreground/80">
                {profile.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.company}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.blog && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.blog.startsWith("http") ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                      {profile.blog}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {profile.twitter_username && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <a href={`https://x.com/${profile.twitter_username}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                      @{profile.twitter_username}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <a href={profile.html_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={<Star className="h-4 w-4" />} label="Stars" value={formatNumber(profileStats.totalStars)} accent="text-yellow-500" />
              <MetricCard icon={<Forklift className="h-4 w-4" />} label="Forks" value={formatNumber(profileStats.totalForks)} accent="text-sky-500" />
              <MetricCard icon={<Eye className="h-4 w-4" />} label="Watchers" value={formatNumber(profileStats.totalWatchers)} accent="text-emerald-500" />
              <MetricCard icon={<Activity className="h-4 w-4" />} label="Open issues" value={formatNumber(profileStats.totalOpenIssues)} accent="text-rose-500" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Flame className="h-4 w-4" />
                    Contribution activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div className="flex min-w-[620px] gap-1">
                      {Array.from({ length: 53 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                          {Array.from({ length: 7 }).map((__, dayIndex) => {
                            const cell = contributionGrid[weekIndex * 7 + dayIndex];
                            const color =
                              cell.count === 0
                                ? "bg-muted"
                                : cell.intensity === 1
                                  ? "bg-emerald-300 dark:bg-emerald-500/50"
                                  : cell.intensity === 2
                                    ? "bg-emerald-400 dark:bg-emerald-500/60"
                                    : cell.intensity === 3
                                      ? "bg-emerald-500 dark:bg-emerald-500/80"
                                      : "bg-emerald-600 dark:bg-emerald-400";

                            return (
                              <div key={`${weekIndex}-${dayIndex}`} className={`h-3 w-3 rounded-sm ${color}`} title={`${cell.date.toDateString()}: ${cell.count} commit${cell.count === 1 ? "" : "s"}`} />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Languages className="h-4 w-4" />
                    Language mix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={languageBreakdown} dataKey="value" nameKey="name" innerRadius={32} outerRadius={56} paddingAngle={3}>
                          {languageBreakdown.map((entry, index) => (
                            <Cell key={`${entry.name}-${index}`} fill={QUOTE_COLOR_PALETTE[index % QUOTE_COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => [`${value} repos`, "Repositories"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 space-y-2 text-xs">
                    {languageBreakdown.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: QUOTE_COLOR_PALETTE[index % QUOTE_COLOR_PALETTE.length] }} />
                          <span>{entry.name}</span>
                        </div>
                        <span className="text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.7fr_1.1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Public repositories</CardTitle>
                <CardDescription>{filteredRepos.length} repos match the current filters</CardDescription>
              </div>
              <Badge variant="secondary">{profile.public_repos} total</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
                <Input value={repoSearch} onChange={(event) => setRepoSearch(event.target.value)} placeholder="Filter repos by name or topic" />
                <Select value={sortKey} onValueChange={setSortKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stars">Stars</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {repoLanguages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language === "all" ? "All languages" : language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredRepos.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No repositories match the current filters.
                  </div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => void openSelectedRepo(repo)}
                      className="w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:bg-accent/30"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{repo.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{repo.description ?? "No description provided."}</p>
                          <div className="flex flex-wrap gap-2">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <Badge key={topic} variant="secondary">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {formatNumber(repo.stargazers_count)}</span>
                          <span className="inline-flex items-center gap-1"><Forklift className="h-3.5 w-3.5" /> {formatNumber(repo.forks_count)}</span>
                          <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatRelativeTime(repo.pushed_at)}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Top repos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileStats.topRepos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No starred repositories available.</p>
              ) : (
                profileStats.topRepos.map((repo) => (
                  <div key={repo.id} className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{repo.name}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{repo.language ?? "Unspecified"} • updated {formatRelativeTime(repo.updated_at)}</p>
                  </div>
                ))
              )}

              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={starsChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <RechartsTooltip formatter={(value: number) => [formatNumber(value), "Stars"]} />
                    <Bar dataKey="stars" radius={[8, 8, 0, 0]} fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No public events available for this profile.</p>
                ) : (
                  events.map((event) => {
                    const summary = getEventSummary(event);
                    return (
                      <div key={event.id} className="flex gap-3 rounded-lg border bg-muted/15 p-3">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {event.type.includes("PullRequest") ? <BookOpen className="h-4 w-4" /> : event.type.includes("Issue") ? <CheckCircle2 className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-medium">{summary.title}</p>
                            <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeTime(event.created_at)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{summary.details}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-4 w-4" />
                Quick explore
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEFAULT_RECENT_SEARCHES.map((profileName) => (
                <Button key={profileName} variant="outline" className="w-full justify-between" onClick={() => void executeSearch(profileName)}>
                  <span>@{profileName}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              ))}

              <div className="pt-3">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Recent searches</p>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent search history yet.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <button key={item} type="button" onClick={() => void executeSearch(item)} className="flex w-full items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm hover:bg-accent/20">
                        <span>{item}</span>
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Drawer open={!!selectedRepo} onOpenChange={(open) => !open && setSelectedRepo(null)}>
        <DrawerContent className="max-h-[90vh] rounded-t-2xl">
          {selectedRepo && (
            <>
              <DrawerHeader className="border-b border-border pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <DrawerTitle>{selectedRepo.name}</DrawerTitle>
                    <DrawerDescription>{selectedRepo.full_name}</DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="outline" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="p-4">
                {readmeLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh] w-full rounded-lg border bg-muted/10 p-4">
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: readmeHtml
                          .replace(/<h1>/gi, '<h1 class="text-2xl font-semibold my-4">')
                          .replace(/<h2>/gi, '<h2 class="text-xl font-semibold my-3">')
                          .replace(/<h3>/gi, '<h3 class="text-lg font-semibold my-2">')
                          .replace(/<pre>/gi, '<pre class="overflow-x-auto rounded-lg bg-muted/30 p-3 my-4">')
                          .replace(/<code>/gi, '<code class="rounded bg-muted/50 px-1 py-0.5">')
                          .replace(/<a /gi, '<a class="text-primary underline underline-offset-4" '),
                      }}
                    />
                  </ScrollArea>
                )}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

const MetricCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <div className={accent}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default Index;
