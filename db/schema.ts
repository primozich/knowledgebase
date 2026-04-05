import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const references = sqliteTable("references", {
  id: text("id").primaryKey(),
  url: text("url").notNull().unique(),
  type: text("type", { enum: ["webpage", "tweet", "podcast", "youtube"] }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  metadata: text("metadata"), // JSON string for type-specific extras
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  referenceId: text("reference_id")
    .notNull()
    .references(() => references.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const referenceTags = sqliteTable("reference_tags", {
  referenceId: text("reference_id")
    .notNull()
    .references(() => references.id, { onDelete: "cascade" }),
  tagId: text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export type Reference = typeof references.$inferSelect;
export type NewReference = typeof references.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
