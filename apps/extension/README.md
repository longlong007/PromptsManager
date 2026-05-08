# AI Prompt Manager Extension

## Development

```bash
pnpm install
pnpm --filter extension dev
```

## Build

```bash
pnpm --filter extension build
```

## Load in Chrome

1. Run the build command.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the `apps/extension/dist` folder.

## Verify after loading

- Open the side panel entry from the extension icon.
- Confirm prompt list, search, copy, and AI optimize actions render.
- Try a Supabase login with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured.

## Required environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Optional: `VITE_SUPABASE_FUNCTION_URL`

## Supabase tables

Use the schema in `supabase/schema.sql` and make sure RLS is enabled.
