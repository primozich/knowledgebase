# Knowledgebase

A personal reference library for saving and annotating links from the web. Paste a URL and the app auto-fetches its title, description, and thumbnail; add notes; search and filter by type.

## Architecture

### Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **SQLite** via `better-sqlite3` with **Drizzle ORM** for schema and migrations
- **Tailwind CSS v4** for styling
- **Cheerio** for HTML scraping; YouTube/Twitter oEmbed APIs for rich metadata

### Directory layout

```
app/
  page.tsx              # Home — search/filter reference list (Server Component)
  layout.tsx            # Root layout with header
  ref/[id]/page.tsx     # Reference detail + notes (Server Component)
  api/references/
    route.ts            # GET (search) / POST (add reference)
    [id]/route.ts       # GET / DELETE single reference
    [id]/notes/
      route.ts          # POST note
      [noteId]/route.ts # PATCH / DELETE note

components/
  AddButton.tsx         # Opens the add-reference modal
  AddReferenceModal.tsx # URL input form; triggers metadata fetch
  ReferenceCard.tsx     # Card shown in the reference list
  NoteEditor.tsx        # Note list with inline add/edit/delete
  DeleteButton.tsx      # Deletes a reference and redirects home

db/
  schema.ts             # Drizzle table definitions (references, notes, tags)
  index.ts              # Database singleton (WAL mode, FK constraints)
  migrate.ts            # Migration runner script
  migrations/           # Generated SQL files

lib/
  metadata.ts           # URL type detection + metadata fetching
```

### Data model

```
references
  id, url (unique), type (webpage|tweet|podcast|youtube)
  title, description, thumbnailUrl, metadata
  createdAt, updatedAt

notes
  id, referenceId → references.id (cascade delete)
  content, createdAt, updatedAt
```

### Key flows

**Add reference** — user pastes URL → POST `/api/references` → `fetchMetadata()` detects type, calls oEmbed or scrapes Open Graph tags → record saved with UUID → redirect to detail page.

**Search** — URL params `?q=&type=` passed to Server Component → Drizzle LIKE + eq query → renders cards.

**Notes** — detail page is a Server Component that reads notes directly from DB; `NoteEditor` is a Client Component that calls the notes API and calls `router.refresh()` after mutations.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
