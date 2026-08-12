import os
import re
import json

workspace = "/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry"
output_path = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch/screens_metadata.json"

vb_files = [f for f in os.listdir(workspace) if f.endswith(".vb") and not f.endswith(".Designer.vb")]

screens = {}

control_decl_pattern = re.compile(r'Friend\s+WithEvents\s+(\w+)\s+As\s+([\w\.]+)', re.IGNORECASE)
event_handler_pattern = re.compile(r'Sub\s+(\w+)\(.*?\)\s*Handles\s+(.*?)$', re.IGNORECASE)

for f in vb_files:
    form_name = f[:-3] # remove .vb
    designer_name = form_name + ".Designer.vb"
    designer_path = os.path.join(workspace, designer_name)
    vb_path = os.path.join(workspace, f)
    
    controls = []
    if os.path.exists(designer_path):
        with open(designer_path, "r", encoding="utf-8", errors="ignore") as df:
            d_content = df.read()
            for match in control_decl_pattern.finditer(d_content):
                controls.append({
                    "name": match.group(1),
                    "type": match.group(2).split(".")[-1] # just class name, e.g. TextBox
                })
                
    handlers = []
    if os.path.exists(vb_path):
        with open(vb_path, "r", encoding="utf-8", errors="ignore") as vf:
            v_content = vf.read()
            for match in event_handler_pattern.finditer(v_content):
                handlers.append({
                    "method": match.group(1),
                    "handles": match.group(2).strip()
                })
                
    screens[form_name] = {
        "file_path": f"Gate Entry/{f}",
        "controls": controls,
        "handlers": handlers
    }

with open(output_path, "w") as out:
    json.dump(screens, out, indent=2)

print(f"Form details extracted for {len(screens)} forms.")
