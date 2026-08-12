import json
import os

scratch_dir = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch"

with open(os.path.join(scratch_dir, "form_summaries.json")) as f:
    summaries = json.load(f)

print(f"Total forms summarized: {len(summaries)}")

# Rank by queries + controls
ranked = []
for s in summaries:
    total_ctrls = len(s["buttons"]) + len(s["textboxes"]) + len(s["combos"]) + len(s["grids"]) + len(s["checkboxes"])
    queries_count = len(s["queries"])
    validations_count = len(s["validations"])
    rules_count = len(s["rules"])
    ranked.append({
        "name": s["name"],
        "ctrls": total_ctrls,
        "queries": queries_count,
        "validations": validations_count,
        "rules": rules_count,
        "navs": s["navigation_targets"]
    })

ranked.sort(key=lambda x: (x["queries"], x["ctrls"]), reverse=True)

print("\nTop Forms by Complexity:")
print(f"{'Form Name':<30} | {'Ctrls':<5} | {'Queries':<7} | {'Validations':<11} | {'Rules':<5} | {'Nav Targets'}")
print("-" * 90)
for r in ranked[:25]:
    print(f"{r['name']:<30} | {r['ctrls']:<5} | {r['queries']:<7} | {r['validations']:<11} | {r['rules']:<5} | {', '.join(r['navs'])}")
