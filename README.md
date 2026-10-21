# Little Yes

A responsive prototype for building a personalized courage list from a short onboarding questionnaire.

## Getting started

Requires Node.js and Yarn 4.

```sh
yarn install
yarn dev
```

## Available scripts

- `yarn dev` — start the local Vite development server
- `yarn build` — type-check and create a production build in `dist/`
- `yarn preview` — preview the production build locally
- `yarn typecheck` — run the TypeScript project checks

## Current prototype

Users choose the life areas they want to focus on, the level of challenge and energy that fits, whether they prefer solo or shared activities, and an optional personal intention. A local rules-based generator filters and shuffles a curated dare collection to create a list that fits those answers.

No AI model or external service is called yet. Answers, generated dares, and completion progress stay in browser local storage. The interface is ready to evolve into a server-backed AI experience later; API keys must not be placed in the browser.
