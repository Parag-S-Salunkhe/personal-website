# Third-party notices

Files in `.claude/skills/` copied (read-only, via the GitHub API on 2026-11-10) from the open-source projects below. Only markdown was copied: no scripts, hooks, settings or MCP configs. Every file was scanned for hooks, auto-run shell (`!`), script calls, encoded blobs, hidden Unicode and injection-style text before use. Modifications are noted. The skills `site-design`, `seo-nextjs` and `security-audit` (their SKILL.md files and `seo-nextjs/references/site-context.md`) are original to this project, synthesised from these sources.

| Upstream repo | Upstream path | Commit | Licence | Local file |
|---|---|---|---|---|
| [elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills) | `skills/landing-page-design/SKILL.md` | `4fdcdd52f15e` | MIT | `site-design/references/landing-page-design.md` |
| [elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills) | `LICENSE` | `bd27ae223806` | MIT | `licenses/MIT-elayadesign.txt` |
| [elayadesign/redesign-skill](https://github.com/elayadesign/redesign-skill) | `skills/redesign-existing-projects/SKILL.md` | `7df13f6a289f` | MIT | `site-design/references/redesign-existing-projects.md` |
| [anthropics/skills](https://github.com/anthropics/skills) | `skills/frontend-design/SKILL.md` | `41bbe19d1a1a` | Apache-2.0 (per-skill LICENSE.txt) | `site-design/references/frontend-design.md` |
| [anthropics/skills](https://github.com/anthropics/skills) | `skills/frontend-design/LICENSE.txt` | `ef740771ac90` | Apache-2.0 (per-skill LICENSE.txt) | `licenses/Apache-2.0-anthropic-frontend-design.txt` |
| [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | `command.md` | `4ecfb9fb8d1d` | MIT | `site-design/references/web-interface-guidelines.md` |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `.claude/skills/impeccable/reference/craft-floor.md` | `b29942e5d98b` | Apache-2.0 | `site-design/references/impeccable-craft-floor.md` |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `.claude/skills/impeccable/reference/mode-read.md` | `5e7914c46890` | Apache-2.0 | `site-design/references/impeccable-mode-read.md` |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `.claude/skills/ui-ux-pro-max/references/quick-reference.md` | `4f2dbb67e649` | MIT | `site-design/references/ui-ux-pro-max-quick-reference.md` |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `skills/seo-audit/SKILL.md` | `c01f0843c4fb` | MIT | `seo-nextjs/references/seo-audit.md` |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `skills/schema/SKILL.md` | `6d123b4fae5f` | MIT | `seo-nextjs/references/schema.md` |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `skills/schema/references/schema-examples.md` | `e8f548b6c5c0` | MIT | `seo-nextjs/references/schema-examples.md` |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `skills/launch/references/site-launch-qa.md` | `759933ed7690` | MIT | `seo-nextjs/references/site-launch-qa.md` |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `skills/copywriting/SKILL.md` | `6d123b4fae5f` | MIT | `site-design/references/copywriting.md` |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | `skills/copywriting/references/ai-tells.md` | `115c9071aaf6` | MIT | `site-design/references/ai-tells.md` |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | `skills/seo-technical/SKILL.md` | `3013278990b8` | MIT | `seo-nextjs/references/technical-seo.md (script/paid-API lines removed)` |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | `skills/seo/references/schema-types.md` | `02d826b9bafd` | MIT | `seo-nextjs/references/schema-types.md` |
| [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | `skills/seo/references/cwv-thresholds.md` | `fa51b599a9bb` | MIT | `seo-nextjs/references/cwv-thresholds.md (API-key example removed)` |
| [obra/superpowers](https://github.com/obra/superpowers) | `skills/verification-before-completion/SKILL.md` | `3be5aad3dd24` | MIT | `verify-before-done/SKILL.md (renamed)` |
| [obra/superpowers](https://github.com/obra/superpowers) | `skills/systematic-debugging/SKILL.md` | `bb92a7774141` | MIT | `systematic-debugging/SKILL.md (cross-skill refs adapted)` |
| [obra/superpowers](https://github.com/obra/superpowers) | `skills/systematic-debugging/root-cause-tracing.md` | `5bf4e7801107` | MIT | `systematic-debugging/root-cause-tracing.md (script reference removed)` |
| [obra/superpowers](https://github.com/obra/superpowers) | `skills/requesting-code-review/SKILL.md` | `bb92a7774141` | MIT | `code-review/SKILL.md (renamed)` |
| [obra/superpowers](https://github.com/obra/superpowers) | `skills/requesting-code-review/code-reviewer.md` | `5bf4e7801107` | MIT | `code-review/code-reviewer.md` |
| [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) | `.claude/commands/security-review.md` | `c19afa74097b` | MIT | `security-audit/references/security-review-method.md (auto-run shell lines replaced)` |

## Licences

- **MIT** (elayadesign/ai-design-skills, elayadesign/redesign-skill, vercel-labs/web-interface-guidelines, nextlevelbuilder/ui-ux-pro-max-skill, coreyhaines31/marketingskills, AgriciDaniel/claude-seo, obra/superpowers, anthropics/claude-code-security-review): permission is granted free of charge to use, copy, modify and distribute, provided the copyright notice and permission notice are included. Full text: `licenses/MIT-elayadesign.txt` (identical MIT terms; copyright belongs to each project's authors).
- **Apache-2.0** (anthropics/skills `frontend-design`, pbakaus/impeccable): full text in `licenses/Apache-2.0-anthropic-frontend-design.txt`. The modified files carry the notes above.
- `landing-page-design.md` itself credits parts adapted from Leonxlnx/taste-skill (MIT); that notice is preserved inside the file.
