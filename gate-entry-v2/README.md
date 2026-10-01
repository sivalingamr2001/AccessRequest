# Install (Antigravity)

Copy into the project root:

    AGENTS.md
    .agents/rules/*.md
    .agents/workflows/*.md

Then in Antigravity open Customizations > Rules and set activation per rule file
(Always On for 01–05 is a reasonable start; lower it if the context feels heavy).
Workflows run as slash commands: /new-widget, /new-feature-route, /review-ui.

If your version still uses `.agent/` (singular), rename the folder.
