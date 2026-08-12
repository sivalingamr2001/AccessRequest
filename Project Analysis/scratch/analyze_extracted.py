import json
import re
import os

scratch_dir = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch"

with open(os.path.join(scratch_dir, "extracted_queries.json")) as f:
    queries_data = json.load(f)

with open(os.path.join(scratch_dir, "extracted_validations.json")) as f:
    validations_data = json.load(f)

with open(os.path.join(scratch_dir, "extracted_rules.json")) as f:
    rules_data = json.load(f)

# Find tables used in queries
# Very simple table regex: "from \w+" or "join \w+" or "into \w+" or "update \w+"
table_patterns = [
    re.compile(r'\bfrom\s+([a-zA-Z0-9_\.]+)', re.IGNORECASE),
    re.compile(r'\bjoin\s+([a-zA-Z0-9_\.]+)', re.IGNORECASE),
    re.compile(r'\binto\s+([a-zA-Z0-9_\.]+)', re.IGNORECASE),
    re.compile(r'\bupdate\s+([a-zA-Z0-9_\.]+)', re.IGNORECASE),
    re.compile(r'\bmerge\s+into\s+([a-zA-Z0-9_\.]+)', re.IGNORECASE)
]

all_tables = set()
queries_by_table = {}
queries_by_file = {}
unsafe_queries = []

for entry in queries_data:
    filename = entry["file"]
    queries_by_file[filename] = []
    for q in entry["queries"]:
        q_text = q["query"]
        # clean up double spaces and newlines
        q_clean = " ".join(q_text.split())
        queries_by_file[filename].append(q_clean)
        
        # Check for SQL injection (concatenation with variables or text box inputs)
        is_unsafe = False
        if "&" in q_text or "txt" in q_text or "lbl" in q_text or "+" in q_text:
            is_unsafe = True
            unsafe_queries.append({
                "file": filename,
                "method": q["method"],
                "line": q["line"],
                "query": q_text
            })
            
        found_tables = []
        for pat in table_patterns:
            for match in pat.finditer(q_clean):
                table_name = match.group(1).upper()
                # filter out subquery keywords or parentheses
                if table_name not in ["SELECT", "VALUES", "WHERE", "INNER", "LEFT", "RIGHT", "CROSS", "OUTER", "ON", "AND", "OR", "UNION"]:
                    # Clean up
                    table_name = table_name.strip("() ")
                    all_tables.add(table_name)
                    found_tables.append(table_name)
                    
        for tbl in found_tables:
            if tbl not in queries_by_table:
                queries_by_table[tbl] = []
            queries_by_table[tbl].append({
                "file": filename,
                "method": q["method"],
                "line": q["line"],
                "query": q_clean
            })

print(f"Total files with queries: {len(queries_data)}")
print(f"Unique tables identified: {len(all_tables)}")
print(f"Tables list: {sorted(list(all_tables))}")
print(f"Unsafe/concatenated queries: {len(unsafe_queries)}")

# Let's print table statistics
print("\nTable Usage Stats:")
for tbl, usages in sorted(queries_by_table.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"- {tbl}: {len(usages)} usages")

# Let's write table and query mapping details for queries.md
summary_info = {
    "total_queries": sum(len(x["queries"]) for x in queries_data),
    "unique_tables": sorted(list(all_tables)),
    "unsafe_queries_count": len(unsafe_queries),
    "queries_by_table_count": {k: len(v) for k, v in queries_by_table.items()}
}

with open(os.path.join(scratch_dir, "query_summary_stats.json"), "w") as f:
    json.dump(summary_info, f, indent=2)
