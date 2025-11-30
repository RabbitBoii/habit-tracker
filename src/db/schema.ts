import { pgTable, serial, text, boolean, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"


// Define the Status Enum
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const statusEnum = pgEnum("status", ["todo", "in_progress", "done"]);


export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id").unique().notNull(),
    email: text("email").notNull(),
    name: text("name"),
    credits: integer("credits").default(10).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const projects = pgTable("projects", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    colorCode: text("color_code").default("#000000"),
    isArchived: boolean("is_archived").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})


export const tasks = pgTable("tasks", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // This will match Clerk ID
    projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date"),
    priority: priorityEnum("priority").default("medium"), // low, medium, high
    status: statusEnum("status").default("todo"),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const userRelations = relations(users, ({ many }) => ({
    projects: many(projects),
    tasks: many(tasks),
}))


export const projectRelations = relations(projects, ({ one, many }) => ({
    users: one(users, {
        fields: [projects.userId],
        references: [users.id],
    }),
    tasks: many(tasks),
}))

export const taskRelations = relations(tasks, ({ one }) => ({
    projects: one(projects, {
        fields: [tasks.projectId],
        references: [projects.id],
    }),
    users: one(users, {
        fields: [tasks.userId],
        references: [users.id],
    }),
}))