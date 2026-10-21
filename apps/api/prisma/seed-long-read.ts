import { readFile } from "node:fs/promises";
import { prisma } from "../src/lib/prisma.js";
import { estimateReadingTime } from "../src/modules/articles/article.reading-time.js";

const slug = "test-ein-tag-mit-offenen-augen";
try {
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    console.log(`Тестова стаття вже існує: ${existing.id}. Зміни редактора збережено.`);
  } else {
    const content = await readFile(new URL("./fixtures/long-read.md", import.meta.url), "utf8");
    const estimate = estimateReadingTime(content);
    if (estimate.minutes < 10) throw new Error("Тестовий текст має бути не коротшим за 10 хвилин.");
    const section = await prisma.section.findFirst({ where: { isVisible: true, slug: { not: "locations" } }, orderBy: [{ navigationOrder: "asc" }, { id: "asc" }] });
    if (!section) throw new Error("Спочатку створіть видимий редакційний розділ у CMS.");
    const article = await prisma.$transaction(async tx => {
      const author = await tx.author.create({ data: { name: "DORIDA · Testredaktion", bio: "Fiktiver Testautor für die Layoutprüfung." } });
      return tx.article.create({ data: {
        slug, title: "TEST · Ein Tag mit offenen Augen", subtitle: "Ein literarischer Spaziergang über Aufmerksamkeit, Orte und die Geschichten dazwischen.",
        excerpt: "Ein ausdrücklich fiktiver Langtext zum Testen des Leseflusses, der Vorschaukarten und der Lesezeit. Keine journalistische Reportage.",
        content, readingTime: estimate.minutes, status: "DRAFT", authorId: author.id, sectionId: section.id,
      } });
    });
    console.log(`Створено одну ЧЕРНЕТКУ: ${article.title}. ${estimate.words} слів, ${estimate.minutes} хв. Відкрийте /admin/articles/${article.id}; для перевірки публічного пошуку опублікуйте її в CMS.`);
  }
} finally {
  await prisma.$disconnect();
}
