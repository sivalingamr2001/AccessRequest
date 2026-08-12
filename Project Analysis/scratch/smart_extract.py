import os
import re
import json

workspace = "/Users/sivalingam/Documents/GitHub/AccessRequest/GateEntry/Gate Entry"
output_dir = "/Users/sivalingam/.gemini/antigravity-ide/brain/5a6ae46c-03b6-416c-b5f8-897a8869d28c/scratch"

vb_files = [f for f in os.listdir(workspace) if f.endswith(".vb") and not f.endswith(".Designer.vb")]

# We want to reconstruct sql assignments.
# Let's search for:
# sql = "..."
# sql &= "..."
# RETVAL(sql) or SCMRETVAL(sql) or OracleDataAdapter(sql) or OracleCommand(sql) or similar

def parse_file(filename):
    path = os.path.join(workspace, filename)
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
    lines = content.splitlines()
    
    # Let's break the file into Sub/Function blocks
    blocks = []
    current_block = []
    block_name = "Global"
    block_start_line = 1
    
    for idx, line in enumerate(lines):
        line_num = idx + 1
        stripped = line.strip()
        
        # Check start of sub or function
        if re.match(r'^\s*(?:Public|Private|Protected|Friend|Overridable|Overrides|Shared)?\s*(?:Sub|Function)\s+(\w+)', line, re.IGNORECASE):
            # Save previous block
            if current_block:
                blocks.append((block_name, block_start_line, current_block))
            current_block = [line]
            match = re.match(r'^\s*(?:Public|Private|Protected|Friend|Overridable|Overrides|Shared)?\s*(?:Sub|Function)\s+(\w+)', line, re.IGNORECASE)
            block_name = match.group(1)
            block_start_line = line_num
        elif re.match(r'^\s*End\s+(?:Sub|Function)', line, re.IGNORECASE):
            current_block.append(line)
            blocks.append((block_name, block_start_line, current_block))
            current_block = []
            block_name = "Global"
            block_start_line = line_num + 1
        else:
            current_block.append(line)
            
    if current_block:
        blocks.append((block_name, block_start_line, current_block))

    file_queries = []
    file_validations = []
    file_rules = []
    
    for bname, start_l, blines in blocks:
        # Let's reconstruct SQL queries inside this block
        # We trace variables like sql, sql1, cl.sql, a, b, c, s
        # A simple state machine tracking assignments to sql variables:
        sql_vars = ["sql", "sql1", "cl.sql", "a", "b", "c", "s", "x", "x1", "INS", "qry"]
        var_values = {v: "" for v in sql_vars}
        
        for lidx, bline in enumerate(blines):
            curr_line_num = start_l + lidx
            tbl = bline.strip()
            
            # Look for assignments: var = "..." or var &= "..."
            # Let's match assignments using regex
            assign_match = re.match(r'^\s*(?:(?:Dim|Public|Private|Friend)\s+)?(sql|sql1|cl\.sql|a|b|c|s|x|x1|INS|qry)\s*(=|&=)\s*(.*)$', tbl, re.IGNORECASE)
            if assign_match:
                var_name = assign_match.group(1).lower()
                op = assign_match.group(2)
                expr = assign_match.group(3)
                
                # Extract string literal if possible
                str_lit = ""
                # Simple extraction: find first " and last "
                first_quote = expr.find('"')
                last_quote = expr.rfind('"')
                if first_quote != -1 and last_quote != -1 and first_quote != last_quote:
                    str_lit = expr[first_quote+1:last_quote]
                else:
                    # Might be a variable or non-string assignment
                    str_lit = f" [{expr}] "
                
                if op == "=":
                    var_values[var_name] = str_lit
                else: # &=
                    var_values[var_name] += " " + str_lit
            
            # Now, check if a query execution or data adapter fill occurs
            # e.g., RETVAL(sql), SCMRETVAL(sql), OracleDataAdapter(sql, ...), OracleCommand(sql, ...)
            exec_match = re.search(r'(?:RETVAL|SCMRETVAL|OracleDataAdapter|OracleCommand|SqlCommand|SqlDataAdapter|OdbcDataAdapter|OdbcCommand)\s*\(\s*(sql|sql1|cl\.sql|a|b|c|s|x|x1|INS|qry|"[^"]+")', tbl, re.IGNORECASE)
            if exec_match:
                param = exec_match.group(1).strip().lower()
                final_query = ""
                if param.startswith('"') and param.endswith('"'):
                    final_query = param[1:-1]
                elif param in var_values:
                    final_query = var_values[param]
                else:
                    final_query = f"Variable: {param}"
                
                if final_query and ("select" in final_query.lower() or "insert" in final_query.lower() or "update" in final_query.lower() or "delete" in final_query.lower() or "exec" in final_query.lower() or "merge" in final_query.lower()):
                    file_queries.append({
                        "method": bname,
                        "line": curr_line_num,
                        "raw_line": tbl,
                        "query": final_query.strip(),
                        "variable": param
                    })
                    
            # Check for direct execution of literal string queries in calls
            literal_exec = re.search(r'(?:RETVAL|SCMRETVAL)\(\s*"(.*?)"\s*\)', tbl, re.IGNORECASE)
            if literal_exec:
                lit_q = literal_exec.group(1)
                file_queries.append({
                    "method": bname,
                    "line": curr_line_num,
                    "raw_line": tbl,
                    "query": lit_q,
                    "variable": "literal"
                })

            # Validations
            if "msgbox" in tbl.lower() or "messagebox" in tbl.lower() or "errorprovider" in tbl.lower():
                # Try to find preceding If statement
                # We can search back 1-5 lines for "If"
                found_if = ""
                for back_offset in range(1, 6):
                    back_idx = lidx - back_offset
                    if back_idx >= 0:
                        back_line = blines[back_idx].strip()
                        if back_line.lower().startswith("if "):
                            found_if = back_line
                            break
                file_validations.append({
                    "method": bname,
                    "line": curr_line_num,
                    "raw_line": tbl,
                    "condition": found_if
                })
                
            # Business rules (toggles, state changes, mathematical equations, date validations)
            if (".enabled =" in tbl.lower() or ".visible =" in tbl.lower()) and ("if " in tbl.lower() or "else" in tbl.lower() or "select " in tbl.lower() or lidx > 0 and "if " in blines[lidx-1].lower()):
                file_rules.append({
                    "method": bname,
                    "line": curr_line_num,
                    "raw_line": tbl
                })
                
    return file_queries, file_validations, file_rules

all_queries = []
all_validations = []
all_rules = []

for filename in vb_files:
    q, v, r = parse_file(filename)
    if q:
        all_queries.append({"file": filename, "queries": q})
    if v:
        all_validations.append({"file": filename, "validations": v})
    if r:
        all_rules.append({"file": filename, "rules": r})
        
# Write to JSON for inspection
with open(os.path.join(output_dir, "extracted_queries.json"), "w") as f:
    json.dump(all_queries, f, indent=2)
with open(os.path.join(output_dir, "extracted_validations.json"), "w") as f:
    json.dump(all_validations, f, indent=2)
with open(os.path.join(output_dir, "extracted_rules.json"), "w") as f:
    json.dump(all_rules, f, indent=2)

print("Smart extraction finished!")
print(f"Captured {sum(len(x['queries']) for x in all_queries)} queries.")
print(f"Captured {sum(len(x['validations']) for x in all_validations)} validations.")
print(f"Captured {sum(len(x['rules']) for x in all_rules)} UI rules.")
