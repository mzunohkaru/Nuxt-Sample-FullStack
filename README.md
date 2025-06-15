# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing Nuxt server APIs.

### Prerequisites

Ensure you have installed the project dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running Tests

The following npm scripts are available for running tests:

*   **`npm test`**: Runs all tests once.
    ```bash
    npm test
    ```
*   **`npm run test:watch`**: Runs tests in watch mode, rerunning on file changes.
    ```bash
    npm run test:watch
    ```
*   **`npm run test:coverage`**: Runs all tests and generates a coverage report (viewable in `./coverage/index.html`).
    ```bash
    npm run test:coverage
    ```

### Mocking Strategy

*   **Prisma Client**: The Prisma client (`~/server/database`) is mocked using Vitest's `vi.mock`. The mock setup can be found in `tests/setup/database.mock.ts`. This allows tests to run without a live database connection by providing controlled responses for database queries.
*   **Nuxt Utilities**: Nuxt 3's server utilities (like `getMethod`, `createError` from `h3`) are mocked within the test files themselves (e.g., `tests/server/api/users/index.get.test.ts`) using `vi.mock('h3', ...)` to simulate different request conditions and error states.
