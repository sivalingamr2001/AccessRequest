import os
import re
import json

workspace = "/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry"

# Regex patterns
sql_pattern = re.compile(r'(select\s+|insert\s+into\s+|update\s+|delete\s+from\s+|exec\s+|RETVAL\s*\(|SCMRETVAL\s*\()', re.IGNORECASE)
msgbox_pattern = re.compile(r'MsgBox\s*\((.*?)\)|MessageBox\.Show\s*\((.*?)\)', re.IGNORECASE)
if_pattern = re.compile(r'\bIf\b(.*?)\bThen\b', re.IGNORECASE)
select_case_pattern = re.compile(r'\bSelect\s+Case\b(.*?)$', re.IGNORECASE)
sub_handles_pattern = re.compile(r'Sub\s+(\w+)\(.*?\)\s*Handles\s+(.*?)$', re.IGNORECASE)

vb_files = [f for f in os.listdir(workspace) if f.endswith(".vb") and not f.endswith(".Designer.vb")]

results = {}

for vb in vb_files:
    path = os.path.join(workspace, vb)
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    
    file_queries = []
    file_msgboxes = []
    file_handlers = []
    file_ifs = []
    
    current_sub = "Module Level"
    
    # Simple multi-line string accumulator for SQL
    in_string_building = False
    sql_accumulator = ""
    sql_start_line = 0

    for idx, line in enumerate(lines):
        line_num = idx + 1
        stripped = line.strip()
        
        # Track active subroutine
        sub_match = re.search(r'Sub\s+(\w+)\(', line, re.IGNORECASE)
        if sub_match:
            current_sub = sub_match.group(1)
            # Check if it handles events
            handles_match = sub_handles_pattern.search(line)
            if handles_match:
                file_handlers.append({
                    "name": current_sub,
                    "handles": handles_match.group(2).strip(),
                    "line": line_num
                })
        
        func_match = re.search(r'Function\s+(\w+)\(', line, re.IGNORECASE)
        if func_match:
            current_sub = func_match.group(1)

        # SQL detection
        if sql_pattern.search(line):
            file_queries.append({
                "sub": current_sub,
                "line": line_num,
                "text": stripped
            })
            
        # Messagebox/Validation messages
        if msgbox_pattern.search(line):
            file_msgboxes.append({
                "sub": current_sub,
                "line": line_num,
                "text": stripped
            })
            
        # Conditional Logic
        if if_pattern.search(line):
            # Only keep complex ones or validations
            if "MsgBox" in line or "MessageBox" in line or "And" in line or "Or" in line or "=" in line:
                file_ifs.append({
                    "sub": current_sub,
                    "line": line_num,
                    "text": stripped
                })
                
    results[vb] = {
        "queries": file_queries,
        "msgboxes": file_msgboxes,
        "handlers": file_handlers,
        "ifs": file_ifs,
        "total_lines": len(lines)
    }

# Save results to json
output_path = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch/analysis_summary.json"
with open(output_path, "w") as f:
    json.dump(results, f, indent=2)

print(f"Analysis completed. Found {len(vb_files)} VB.NET files. Summary written to {output_path}")
