const fs = require("fs");
const path = "frontend/src/pages/SearchPage.tsx";
let s = fs.readFileSync(path, "utf8");
const start = "useEffect(() => {";
const end = "}, []);";
const i = s.indexOf(start);
if (i === -1) {
  console.error("start not found");
  process.exit(1);
}
const j = s.indexOf(end, i);
if (j === -1) {
  console.error("end not found");
  process.exit(1);
}
const before = s.slice(0, i);
const after = s.slice(j + end.length);
const replacement = [
  "useEffect(() => {",
  "    async function loadBusinesses() {",
  "      try {",
  "        const params = new URLSearchParams();",
  '        if (query && query.trim()) params.set("q", query.trim());',
  '        if (activeCategory && activeCategory !== "All Categories")',
  '          params.set("category", activeCategory);',
  '        params.set("verified", verifiedOnly ? "true" : "false");',
  '        params.set("sort", activeSort.toLowerCase());',
  "",
  "        const url = '/api/companies' + (params.toString() ? '?' + params.toString() : '');",
  "        const response = await fetch(url);",
  "        if (!response.ok) {",
  '          throw new Error("Failed to fetch companies");',
  "        }",
  "        const data = await response.json();",
  "        const mapped = Array.isArray(data.companies)",
  "          ? data.companies.map((company: any) => ({",
  "              id: company.id,",
  "              slug: company.slug,",
  "              name: company.name,",
  '              category: company.category || "General",',
  '              location: company.location || "Unknown location",',
  "              score: Number(company.trustScore || 0),",
  "              rating: Number(company.rating || 0),",
  "              reviewsCount: Number(company.reviewsCount || 0),",
  "              description: company.description,",
  "              website: company.website,",
  "            }))",
  "          : [];",
  "        setBusinesses(mapped);",
  "      } catch (error) {",
  "        setBusinesses([]);",
  "      } finally {",
  "        setLoading(false);",
  "      }",
  "    }",
  "",
  "    void loadBusinesses();",
  "  }, [query, activeCategory, verifiedOnly, activeSort]);",
].join("\n");

s = before + replacement + after;
fs.writeFileSync(path, s, "utf8");
console.log("patched SearchPage.tsx");
