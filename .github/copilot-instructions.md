# Demeter repository-wide Copilot instructions

## Response language

- Unless the user explicitly requests another language in the current conversation, respond in Chinese.
- Keep commands, paths, identifiers, and code in their original form, but explain them in Chinese.

## Git safety

- Unless the user explicitly asks for a specific Git operation in the current conversation, do not run any Git command that can change repository state.
- This prohibition includes, but is not limited to, `git commit`, `git merge`, `git rebase`, `git push`, `git pull`, `git checkout`, `git switch`, `git restore`, `git reset`, `git clean`, `git cherry-pick`, and `git stash`.
- If Git context is needed, prefer read-only commands such as `git status`, `git diff`, `git log`, and `git branch --show-current`.
- This rule applies to all work in the repository, including frontend, backend, migrations, configuration, documentation, and mixed changes.
- When the task is complete, leave local working tree changes in place and report what changed instead of creating, rewriting, or publishing commits.