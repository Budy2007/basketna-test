# Phase 1 demo script (10 minutes)

Before starting: the app runs against Atlas (`npm run dev` in `backend/` and `client/`), and these tabs are open:
the app, the GitHub Project board, the Issues list, one merged pull request, the Actions tab, and Insights → Contributors.

| Minutes | Evaluation point | What to show |
|---|---|---|
| 0–1 | Introduction | The problem: feeding a family in Cairo on a budget. The 3 Phase 1 features. |
| 1–4 | 1, 2 · Working demo | Home (stats, shops we compare, cheapest meals). Weekly plan: pick meals, "Copy Saturday to every day", Compare, read the result (totals per shop, recommended shop, bread note). Meals: search "lentil", filter lunch, sort by protein. Prices: cheapest shop highlighted, filter Vegetables. Switch to English once. |
| 4–5 | 3 · Project board | Board by status, Roadmap with dates, milestones (M1, M2, M3), the Phase 2 backlog. |
| 5–6 | 4 · Issues | The "people 0 becomes 4" bug: steps to reproduce, labels, milestone, the linked PR, closed by the merge. |
| 6–7.5 | 5 · Pull requests | One PR: description, `Closes #`, the checks, the commits, the merge commit on `main`. |
| 7.5–8.5 | 6 · GitHub Actions | `.github/workflows/ci.yml`: backend job with a MongoDB service, client job with tests and build. A green run, a red run and the fix. The branch rule that blocks merging on red. |
| 8.5–10 | 7 · Contribution | Insights → Contributors, the commit history on `main`, the issues and PRs list. |

If the Wi-Fi fails: screenshots of each page are in a folder on the desktop.
