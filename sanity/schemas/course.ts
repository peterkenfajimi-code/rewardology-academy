import { defineField, defineType } from "sanity";

export default defineType({
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", type: "text" }),
    defineField({
      name: "level",
      type: "string",
      options: { list: ["Beginner", "Intermediate", "Advanced"] },
    }),
    defineField({ name: "isFree", type: "boolean", initialValue: true }),
    defineField({ name: "price", type: "number" }),
  ],
});
