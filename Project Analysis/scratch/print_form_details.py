import json
import sys
import os

scratch_dir = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch"

with open(os.path.join(scratch_dir, "form_summaries.json")) as f:
    summaries = json.load(f)

forms = {x["name"]: x for x in summaries}

def print_form(name):
    if name not in forms:
        print(f"Form {name} not found.")
        return
    f = forms[name]
    print(f"=== Form: {f['name']} ===")
    print(f"File Path: {f['file_path']}")
    print(f"Buttons ({len(f['buttons'])}): {', '.join(f['buttons'])}")
    print(f"Textboxes ({len(f['textboxes'])}): {', '.join(f['textboxes'])}")
    print(f"ComboBoxes ({len(f['combos'])}): {', '.join(f['combos'])}")
    print(f"Grids ({len(f['grids'])}): {', '.join(f['grids'])}")
    print(f"CheckBoxes ({len(f['checkboxes'])}): {', '.join(f['checkboxes'])}")
    print(f"Navigation Targets: {', '.join(f['navigation_targets'])}")
    print(f"Queries ({len(f['queries'])}):")
    for q in f["queries"]:
        print(f"  [Line {q['line']} in {q['method']}]: {q['query']}")
    print(f"Validations ({len(f['validations'])}):")
    for v in f["validations"]:
        print(f"  [Line {v['line']} in {v['method']}]: {v['condition']} -> {v['raw_line']}")
    print(f"Rules ({len(f['rules'])}):")
    for r in f["rules"]:
        print(f"  [Line {r['line']} in {r['method']}]: {r['raw_line']}")

if len(sys.argv) > 1:
    print_form(sys.argv[1])
else:
    # print top forms by name
    for name in ["Gate", "Add", "Validate", "non-po", "pocheck", "fifo_sticker"]:
        print_form(name)
        print("\n" + "="*80 + "\n")
