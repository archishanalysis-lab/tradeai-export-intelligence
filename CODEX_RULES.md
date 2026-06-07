# Codex Rules For TradeAI

## Main Rule

Do not scan or rewrite the whole project unless explicitly asked.

Before starting work, read these files first:

```txt
PROJECT_OVERVIEW.md
ARCHITECTURE.md
TASKS.md
CODEX_RULES.md
```

Then work only on the exact files needed for the requested task.

## Founder Preference

The founder wants to stay aware of every major change.

Before any major change, explain:

```txt
1. Which files will be edited
2. Why each file needs editing
3. What behavior will change
4. Whether frontend, backend, database, payment or security is affected
```

Then wait for approval.

## Token Saving Rules

- Do not inspect the entire repository unless required.
- Do not read large files unless they are directly relevant.
- Do not re-analyze unrelated folders.
- Do not re-study the whole project again and again.
- Use the root markdown files for project context.
- Ask for the exact file if context is missing.
- Prefer targeted edits over broad refactors.

## File Safety Rules

Never edit these unless explicitly asked:

```txt
.env
backend/.env
node_modules/
backend/node_modules/
```

Never expose, print or commit secrets:

```txt
MONGO_URI
JWT_SECRET
OPENAI_API_KEY
COMTRADE_API_KEY
CLOUDINARY_API_SECRET
RAZORPAY_KEY_SECRET
```

If secrets are found in source files, stop and warn the user.

## Git Safety Rules

Before major edits, suggest checking:

```bash
git status
git branch
```

Do not run destructive commands without permission.

Never run automatically:

```bash
git reset --hard
git clean -fd
rm -rf
git push --force
```

Ask permission first.

## Coding Rules

- Do not duplicate header/footer unnecessarily.
- Do not create multiple versions of the same script.
- Do not create duplicate CSS blocks if existing reusable CSS can be used.
- Do not break login/register flow.
- Do not break role-based dashboard routing.
- Do not remove existing working features.
- Do not rename files unless explicitly asked.
- Do not move files unless explicitly asked.
- Do not change API routes without checking frontend usage.
- Do not install dependencies unless necessary and approved.
- Do not edit unrelated files.

## Frontend Rules

Important frontend folders:

```txt
pages/
css/
js/
assets/
```

Before editing a page, check:

```txt
existing CSS imports
existing JS imports
relative paths
navbar links
register/login links
query parameters
```

New acquisition links should preserve:

```txt
plan
billing
source
intent
country
product
reportType
```

Example:

```txt
register.html?plan=Free&source=india-kenya&intent=kenya-report&country=kenya
```

Current acquisition flow:

```txt
index.html
↓
countries.html / corridors.html / country corridor pages
↓
export-opportunity-report.html / pricing.html
↓
register.html
↓
dashboard personalization
```

This flow must not be broken.

## Backend Rules

Important backend folders:

```txt
backend/controllers/
backend/routes/
backend/models/
backend/services/
backend/middleware/
backend/utils/
```

Before editing backend:

```txt
1. Identify route
2. Identify controller
3. Identify model
4. Check middleware/auth requirement
5. Check frontend usage
6. Check docs/API_TEST_CHECKLIST.md
```

Do not change database schema casually. If model changes are needed, explain impact first.

## Testing Rules

Use existing docs:

```txt
docs/API_TEST_CHECKLIST.md
docs/TESTING_WORKFLOWS.md
docs/DEPLOYMENT_STAGING.md
docs/PRODUCTION_LAUNCH_CHECKLIST.md
```

After code edits, suggest the smallest relevant test.

Examples:

Frontend page change:

```txt
Open page with Live Server and test links/forms.
```

Register flow change:

```txt
Open register.html with query params and verify hidden fields/localStorage.
```

Backend API change:

```txt
Run the relevant item from docs/API_TEST_CHECKLIST.md only.
```

Do not run full test suite unless requested.

## Current Priority Work

```txt
1. Contact page smart prefill
2. Dashboard personalization
3. sitemap.xml
4. robots.txt
5. Header/footer cleanup on major pages
6. Backend signup metadata later
7. Report request backend later
```

## Stop Conditions

Stop and ask before continuing if the task requires:

```txt
editing more than 3 files
authentication changes
payment changes
database model changes
environment variable changes
deleting files
moving files
installing dependencies
running destructive commands
changing deployment configuration
```

## Response Format After Work

After editing files, always summarize:

```txt
Files changed:
- file 1
- file 2

What changed:
- point 1
- point 2

How to test:
- step 1
- step 2

Risk:
- low / medium / high
```

## Permission Rule

If the user asks for a major change, do not directly edit. First say:

```txt
I will edit these files:
1. ...
2. ...

Expected change:
...

Risk:
...

Please confirm before I proceed.
```

Then wait for confirmation.
