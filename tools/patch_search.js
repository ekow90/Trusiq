const fs = require('fs');
const path = 'frontend/src/pages/SearchPage.tsx';
let s = fs.readFileSync(path, 'utf8');
const start = 'useEffect(() => {';
const end = '}, []);';
const i = s.indexOf(start);
if (i === -1) {
  console.error('start not found');
  process.exit(1);
}
const j = s.indexOf(end, i);
if (j === -1) {
  console.error('end not found');
  process.exit(1);
}
const before = s.slice(0, i);
const after = s.slice(j + end.length);
const replacement = `useEffect(() => {\n    async function loadBusinesses() {\n      try {\n        const params = new URLSearchParams();\n        if (query && query.trim()) params.set("q", query.trim());\n        if (activeCategory && activeCategory !== "All Categories")\n          params.set("category", activeCategory);\n        params.set("verified", verifiedOnly ? "true" : "false");\n        params.set("sort", activeSort.toLowerCase());\n\n        const url = `/api/companies${params.toString() ? "?" + params.toString() : ""}`;\n        const response = await fetch(url);\n        if (!response.ok) {\n          throw new Error("Failed to fetch companies");\n        }\n        const data = await response.json();\n        const mapped = Array.isArray(data.companies)\n          ? data.companies.map((company: any) => ({\n              id: company.id,\n              slug: company.slug,\n              name: company.name,\n              category: company.category || "General",\n              location: company.location || "Unknown location",\n              score: Number(company.trustScore || 0),\n              rating: Number(company.rating || 0),\n              reviewsCount: Number(company.reviewsCount || 0),\n              description: company.description,\n              website: company.website,\n            }))\n          : [];\n        setBusinesses(mapped);\n      } catch (error) {\n        setBusinesses([]);\n      } finally {\n        setLoading(false);\n      }\n    }\n\n    void loadBusinesses();\n  }, [query, activeCategory, verifiedOnly, activeSort]);`;

s = before + replacement + after;
fs.writeFileSync(path, s, 'utf8');
console.log('patched SearchPage.tsx');
