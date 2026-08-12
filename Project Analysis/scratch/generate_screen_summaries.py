import json
import os
import re

scratch_dir = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch"

with open(os.path.join(scratch_dir, "screens_metadata.json")) as f:
    screens_meta = json.load(f)

with open(os.path.join(scratch_dir, "extracted_queries.json")) as f:
    queries_data = {x["file"]: x["queries"] for x in json.load(f)}

with open(os.path.join(scratch_dir, "extracted_validations.json")) as f:
    validations_data = {x["file"]: x["validations"] for x in json.load(f)}

with open(os.path.join(scratch_dir, "extracted_rules.json")) as f:
    rules_data = {x["file"]: x["rules"] for x in json.load(f)}

summary_output = []

for form_name, meta in sorted(screens_meta.items()):
    file_name = form_name + ".vb"
    
    # Get associated queries
    queries = queries_data.get(file_name, [])
    # Get associated validations
    validations = validations_data.get(file_name, [])
    # Get associated rules
    rules = rules_data.get(file_name, [])
    
    # Deduplicate controls
    controls = meta["controls"]
    buttons = [c["name"] for c in controls if c["type"] == "Button"]
    textboxes = [c["name"] for c in controls if c["type"] == "TextBox"]
    combos = [c["name"] for c in controls if c["type"] == "ComboBox"]
    grids = [c["name"] for c in controls if c["type"] in ["DataGridView", "DataGrid"]]
    checkboxes = [c["name"] for c in controls if c["type"] == "CheckBox"]
    
    # Search for navigation targets in the VB source
    nav_targets = set()
    vb_path = os.path.join("/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry", file_name)
    if os.path.exists(vb_path):
        with open(vb_path, "r", encoding="utf-8", errors="ignore") as f:
            v_content = f.read()
            # find form.Show or form.ShowDialog
            for match in re.finditer(r'(\w+)\.Show(?:Dialog)?\s*\(', v_content, re.IGNORECASE):
                target = match.group(1)
                if target.lower() not in ["me", "messagebox"]:
                    nav_targets.add(target)
                    
    summary_output.append({
        "name": form_name,
        "file_path": meta["file_path"],
        "buttons": buttons,
        "textboxes": textboxes,
        "combos": combos,
        "grids": grids,
        "checkboxes": checkboxes,
        "handlers_count": len(meta["handlers"]),
        "queries": queries,
        "validations": validations,
        "rules": rules,
        "navigation_targets": list(nav_targets)
    })

with open(os.path.join(scratch_dir, "form_summaries.json"), "w") as out:
    json.dump(summary_output, out, indent=2)

print(f"Aggregated summaries for {len(summary_output)} forms.")
