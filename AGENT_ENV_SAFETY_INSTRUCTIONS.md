# AGENT INSTRUCTIONS: .env Safety Before GitHub Push

**Read and follow exactly before running any `git add`, `git commit`, or `git push` command on this project.**

---

## TASK

Prepare this project's environment variables so it can be safely pushed to a public/private GitHub repository, with zero risk of leaking secrets (MongoDB URI, API keys, tokens, etc.).

---

## STEPS TO PERFORM (IN ORDER)

### Step 1: Check if `.gitignore` exists
- If it doesn't exist in the project root, create it.
- If it exists, check whether it already ignores `.env`.

### Step 2: Ensure `.gitignore` contains these lines
```
.env
.env.local
.env.*.local
.env.production.local
node_modules/
.DS_Store
/build
/dist
```
Do not remove any existing rules already in `.gitignore` — only add what's missing.

### Step 3: Check if `.env` is already tracked by git
Run:
```
git status
git ls-files | grep .env
```
- If `.env` appears as tracked or staged, stop and run:
```
git rm --cached .env
```
This removes it from git tracking without deleting the local file.

### Step 4: Create `.env.example`
- Read the current `.env` file.
- Create `.env.example` with the same variable names, but replace every real value with a generic placeholder.
- Example transformation:
  ```
  # .env (real)
  MONGO_URI=mongodb+srv://siddhant:RealPass123@cluster0.mongodb.net/github_analytics
  PORT=5000

  # .env.example (safe to commit)
  MONGO_URI=mongodb+srv://user:password@cluster...
  PORT=5000
  ```
- Do this for both the frontend and backend project folders if both have `.env` files.

### Step 5: Verify before committing
Run `git status` and confirm:
- `.env` does **NOT** appear in the list of changes to be committed
- `.gitignore` **DOES** appear (new or modified)
- `.env.example` **DOES** appear (new file)

Only proceed to `git add` / `git commit` / `git push` after this is confirmed. If `.env` still shows up, stop and re-check Step 3.

### Step 6: Scan for hardcoded secrets outside `.env`
Search the codebase for any secret values that may have been pasted directly into `.js`/`.jsx` files instead of read from `process.env`. Flag any matches like:
- `mongodb+srv://` inside a `.js` file
- API keys or tokens as string literals
- Passwords as string literals

Replace any found instances with `process.env.VARIABLE_NAME` and confirm the variable exists in `.env` and `.env.example`.

---

## HARD RULES (NEVER DO THESE)

1. Never stage or commit `.env`, under any circumstance, even temporarily.
2. Never print the contents of `.env` to console, logs, or terminal output as part of any command.
3. Never put real credentials into `.env.example`.
4. Never remove `.env` from `.gitignore` to "make testing easier."
5. Never commit directly to `main` with `.env` staged — if this is about to happen, stop and ask before proceeding.
6. If `.env` was already pushed in a previous commit (check with `git log --all --full-history -- .env`), do not just delete it in a new commit — flag this immediately. It requires history rewriting (`git filter-repo` or `git filter-branch`) plus rotating every credential that was exposed (new MongoDB password, new API keys). Do not attempt the history rewrite without confirming first.

---

## FINAL CONFIRMATION CHECKLIST (report this back before pushing)

- [ ] `.gitignore` exists and includes `.env`
- [ ] `.env` is not tracked by git (`git ls-files | grep .env` returns nothing)
- [ ] `.env.example` exists with placeholder values only
- [ ] No hardcoded secrets found in `.js`/`.jsx` files
- [ ] `git status` shows `.env` is absent from staged/committed files
- [ ] `git log --all --full-history -- .env` returns nothing (confirms it was never committed historically)

Report the result of each checklist item. Only push after all six are confirmed.
