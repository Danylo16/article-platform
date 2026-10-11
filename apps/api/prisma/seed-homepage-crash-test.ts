import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(__dirname, "../.env"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const sectionSeeds = [
  { name: "EVENTS", slug: "events", navigationOrder: 1 },
  { name: "LOCATIONS", slug: "locations", navigationOrder: 2 },
  { name: "MODE", slug: "mode", navigationOrder: 3 },
  { name: "KULTUR", slug: "kultur", navigationOrder: 4 },
  { name: "INTERVIEWS", slug: "interviews", navigationOrder: 5 },
  { name: "NEWS", slug: "news", navigationOrder: 6 },
] as const;

const categorySeeds = [
  { name: "Reportage", slug: "reportage" },
  { name: "Kultur", slug: "kultur" },
  { name: "Stadtleben", slug: "stadtleben" },
  { name: "Politik", slug: "politik" },
  { name: "Interviews", slug: "interviews" },
  { name: "Events", slug: "events" },
] as const;

const tagSeeds = [
  { name: "Wien", slug: "wien" },
  { name: "Menschen", slug: "menschen" },
  { name: "Kultur", slug: "kultur" },
  { name: "Stadt", slug: "stadt" },
  { name: "Politik", slug: "politik" },
  { name: "Gespräch", slug: "gespraech" },
] as const;

const locationTypeSeeds = [
  {
    name: "Cafés",
    slug: "cafes",
    icon: "coffee",
    navigationOrder: 1,
  },
  {
    name: "Restaurants",
    slug: "restaurants",
    icon: "restaurant",
    navigationOrder: 2,
  },
  {
    name: "Freizeit",
    slug: "freizeit",
    icon: "music",
    navigationOrder: 3,
  },
] as const;

const placeSeeds = [
  {
    name: "Café Jelinek",
    slug: "cafe-jelinek",
    typeSlug: "cafes",
    address: "Otto-Bauer-Gasse 5, 1060 Wien",
    latitude: 48.1977,
    longitude: 16.3504,
  },
  {
    name: "Karmelitermarkt",
    slug: "karmelitermarkt",
    typeSlug: "restaurants",
    address: "Karmelitermarkt, 1020 Wien",
    latitude: 48.2169,
    longitude: 16.3798,
  },
  {
    name: "WUK",
    slug: "wuk",
    typeSlug: "freizeit",
    address: "Währinger Straße 59, 1090 Wien",
    latitude: 48.2231,
    longitude: 16.3513,
  },
] as const;

type ArticleSeed = {
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string;
  content: string;
  readingTime: number;
  publishedAt: Date;
  sectionSlug: string;
  categorySlug: string | null;
  tagSlugs: string[];
  placeSlug?: string;
};

const articleSeeds: ArticleSeed[] = [
  {
    title: "Wien bei Nacht",
    slug: "crash-test-wien-bei-nacht",
    subtitle: "Eine kurze Geschichte für die kleinste mögliche Kartenhöhe.",
    excerpt: "Kurz, direkt, ohne Umwege.",
    content: `# Wien bei Nacht

Die Stadt klingt nach Mitternacht anders. Straßenbahnen werden seltener, Gespräche leiser, und selbst bekannte Plätze sehen plötzlich fremd aus.

Diese kurze Testgeschichte prüft, wie DORIDA mit wenig Text umgeht.`,
    readingTime: 2,
    publishedAt: new Date("2026-09-15T08:00:00.000Z"),
    sectionSlug: "news",
    categorySlug: "stadtleben",
    tagSlugs: ["wien", "stadt"],
  },
  {
    title:
      "Zwischen Donaukanal und Gemeindebau: Wie junge Wienerinnen ihre Stadt neu erzählen",
    slug: "crash-test-donaukanal-und-gemeindebau",
    subtitle:
      "Eine neue Generation schaut auf Wien, ohne die alten Erzählungen einfach zu übernehmen.",
    excerpt:
      "Sie organisieren Ausstellungen in ehemaligen Werkstätten, drehen Filme in Innenhöfen und machen aus alltäglichen Orten eine öffentliche Bühne.",
    content: `# Zwischen Donaukanal und Gemeindebau

Wien lebt von Bildern, die oft älter sind als die Menschen, die heute durch die Stadt gehen. Fiaker, Kaffeehäuser und imperiale Fassaden gehören dazu. Aber sie erzählen nur einen Teil der Geschichte.

## Eine andere Perspektive

Junge Wienerinnen suchen ihre Motive dort, wo Reiseführer selten stehen bleiben: in Waschküchen, auf Nachtbuslinien und zwischen den Betonwänden großer Wohnanlagen.

Ihre Arbeit ist keine Absage an die Vergangenheit. Sie ist der Versuch, Gegenwart sichtbar zu machen.

## Räume werden neu gelesen

Eine leer stehende Werkstatt kann Galerie, Redaktion oder Treffpunkt werden. Ein Innenhof wird zum Kino. Eine Parkbank wird zum Ort für ein Interview über Arbeit, Familie und Zugehörigkeit.

Die Stadt verändert sich dabei nicht nur baulich. Sie verändert sich durch die Geschichten, die über sie erzählt werden.`,
    readingTime: 6,
    publishedAt: new Date("2026-09-14T11:30:00.000Z"),
    sectionSlug: "news",
    categorySlug: "reportage",
    tagSlugs: ["wien", "menschen", "stadt"],
  },
  {
    title: "Die letzte Trafik im Grätzl",
    slug: "crash-test-letzte-trafik",
    subtitle: null,
    excerpt:
      "Seit vierzig Jahren kennt die Trafik ihre Stammkunden. Jetzt verändert sich die Straße schneller als je zuvor.",
    content: `# Die letzte Trafik im Grätzl

Um sechs Uhr morgens geht das Licht an. Noch bevor die erste Straßenbahn an der Kreuzung hält, liegen Zeitungen auf dem Tresen.

Die Trafik ist Geschäft, Auskunftsstelle und manchmal Beichtstuhl. Wer hier regelmäßig kommt, muss nicht erklären, welche Zeitung oder welches Los gemeint ist.

Doch die Mieten steigen, Gewohnheiten ändern sich und viele Gespräche wandern ins Internet. Was bleibt, ist ein kleiner Raum, in dem Nachbarschaft noch täglich stattfindet.

Die Besitzerin sagt, sie denke nicht in großen Begriffen über das Ende einer Ära nach. Sie öffnet einfach am nächsten Morgen wieder die Tür.`,
    readingTime: 4,
    publishedAt: new Date("2026-09-13T07:15:00.000Z"),
    sectionSlug: "kultur",
    categorySlug: "kultur",
    tagSlugs: ["wien", "kultur", "menschen"],
  },
  {
    title: "Wer entscheidet, wem die Stadt gehört?",
    slug: "crash-test-wem-gehoert-die-stadt",
    subtitle:
      "Über öffentlichen Raum, leistbares Wohnen und Entscheidungen, die im Alltag sichtbar werden.",
    excerpt:
      "Stadtpolitik wirkt abstrakt, bis eine Sitzbank verschwindet, ein Haus verkauft oder ein Platz neu geplant wird.",
    content: `# Wer entscheidet, wem die Stadt gehört?

Politische Entscheidungen zeigen sich selten zuerst in Pressekonferenzen. Sie zeigen sich im Alltag.

## Öffentlicher Raum

Ein Platz kann Durchgang, Treffpunkt, Markt oder Bühne sein. Welche Nutzung Vorrang bekommt, ist keine neutrale Frage. Sie entscheidet darüber, wer bleiben darf und wer nur passieren soll.

## Wohnen

Leistbares Wohnen ist Teil der Wiener Identität. Trotzdem erleben viele junge Menschen, dass der Zugang zu dauerhaft bezahlbaren Wohnungen schwieriger wird.

## Beteiligung

Bürgerbeteiligung funktioniert nur, wenn Ergebnisse offen sind und Rückmeldungen tatsächlich Einfluss haben. Eine Veranstaltung allein ist noch keine Mitbestimmung.

Die Frage, wem die Stadt gehört, hat deshalb keine einfache Antwort. Aber sie sollte regelmäßig und öffentlich gestellt werden.`,
    readingTime: 8,
    publishedAt: new Date("2026-09-12T15:45:00.000Z"),
    sectionSlug: "news",
    categorySlug: "politik",
    tagSlugs: ["wien", "stadt", "politik"],
  },
  {
    title:
      "Ein Gespräch über Kunst, Herkunft und das Gefühl, gleichzeitig hier und anderswo zu Hause zu sein",
    slug: "crash-test-kunst-herkunft-und-zuhausesein",
    subtitle:
      "Die Künstlerin spricht über Sprache, Erinnerung und die Frage, ob Ankommen jemals vollständig abgeschlossen ist.",
    excerpt:
      "Das Atelier liegt im zweiten Hinterhof. Zwischen unfertigen Leinwänden beginnt ein Gespräch, das von Wien über Kyjiw bis zu Familienfotos führt.",
    content: `# Gleichzeitig hier und anderswo

Das Atelier liegt im zweiten Hinterhof eines Hauses, an dem man leicht vorbeigeht. Auf dem Boden stehen unfertige Leinwände, auf dem Tisch liegen Fotografien und Notizen in mehreren Sprachen.

## „Erinnerung ist kein Archiv“

Die Künstlerin beschreibt Erinnerung nicht als geordneten Bestand, sondern als Material, das sich bei jeder Verwendung verändert. Ein Bild aus der Kindheit kann Jahre später eine völlig andere Bedeutung bekommen.

## Sprache als Arbeitsraum

Im Alltag wechselt sie zwischen Deutsch, Ukrainisch und Englisch. In ihrer Kunst versucht sie nicht, diese Sprachen sauber voneinander zu trennen.

> Manchmal ist gerade das falsche Wort das ehrlichste, weil es zeigt, wo eine Übersetzung nicht funktioniert.

## Ankommen ohne Endpunkt

Wien ist längst Alltag geworden. Trotzdem bleibt das Gefühl, mehrere Orte gleichzeitig mitzudenken. Sie versteht das nicht als Defizit, sondern als Perspektive.

Das Gespräch endet nicht mit einer eindeutigen Antwort. Es endet mit einer neuen Skizze auf einem Blatt Papier.`,
    readingTime: 10,
    publishedAt: new Date("2026-09-11T09:20:00.000Z"),
    sectionSlug: "interviews",
    categorySlug: "interviews",
    tagSlugs: ["menschen", "kultur", "gespraech"],
  },
  {
    title: "Sonntag, sieben Uhr",
    slug: "crash-test-sonntag-sieben-uhr",
    subtitle:
      "Beobachtungen von einem Ort, an dem gewöhnlich niemand lange bleibt.",
    excerpt:
      "Der Text dieser Karte ist absichtlich deutlich länger als üblich. Er soll zeigen, ob die Homepage auch dann stabil bleibt, wenn ein Teaser fast die erlaubte Maximallänge erreicht, viele Zeilen beansprucht und mit den Metadaten um den verfügbaren Platz konkurriert. Gute Gestaltung darf nicht davon abhängen, dass jede Redaktion immer exakt gleich lange Texte schreibt. Sie muss schlechte, ungewöhnliche und extreme Eingaben abfangen, ohne dass Kartenhöhen, Abstände oder die gesamte visuelle Hierarchie auseinanderfallen.",
    content: `# Sonntag, sieben Uhr

Der Bahnsteig ist fast leer. Eine Anzeigetafel wechselt zwischen zwei Verspätungen, während aus einem Automaten das Geräusch eines fallenden Pappbechers kommt.

Eine Reinigungskraft zieht ihren Wagen über die Fliesen. Zwei Reisende vergleichen Tickets. Ein Mann liest dieselbe Nachricht mehrmals auf seinem Telefon.

Es passiert nichts Besonderes. Genau deshalb eignet sich dieser Moment, um zu beobachten, wie eine Stadt funktioniert, bevor ihre üblichen Erzählungen beginnen.

Mit jeder ankommenden Bahn wird der Ort lauter. Die kurze Ruhe verschwindet, ohne dass jemand ihren Übergang bemerkt.`,
    readingTime: 3,
    publishedAt: new Date("2026-09-10T05:00:00.000Z"),
    sectionSlug: "news",
    categorySlug: null,
    tagSlugs: ["wien", "menschen"],
  },
  {
    title:
      "Warum ein einziges kleines Festival einen ganzen Bezirk für drei Tage vollkommen anders klingen lässt",
    slug: "crash-test-festival-im-bezirk",
    subtitle:
      "Konzerte, Gespräche und offene Räume bringen Menschen zusammen, die sonst nur aneinander vorbeigehen.",
    excerpt:
      "Ein Test für lange Headlines, mittlere Teaser und die sechste Kategorie in der Navigation.",
    content: `# Drei Tage Festival

Am ersten Abend stehen die Türen noch vorsichtig offen. Am dritten kennt das Publikum die Wege zwischen Bühne, Hof und improvisierter Bar.

Das Festival ist klein genug, um persönlich zu bleiben, und groß genug, um die Wahrnehmung des Viertels zu verändern.

Nach dem letzten Konzert werden Kabel eingerollt und Stühle gestapelt. Für kurze Zeit bleibt die Erinnerung daran, dass dieselben Räume auch anders genutzt werden können.`,
    readingTime: 5,
    publishedAt: new Date("2026-09-09T17:30:00.000Z"),
    sectionSlug: "events",
    categorySlug: "events",
    tagSlugs: ["wien", "kultur", "stadt"],
  },
  {
    title: "Ein Vormittag im Café Jelinek",
    slug: "crash-test-cafe-jelinek",
    subtitle:
      "Ein Wiener Kaffeehaus, das seine Ruhe nicht für einen Trend opfert.",
    excerpt:
      "Zwischen Melange, Zeitung und abgewetzten Polstern bleibt hier Zeit länger liegen als anderswo.",
    content: `# Ein Vormittag im Café Jelinek

Das Café braucht keine Inszenierung. Die roten Polster, die Zeitungen und das gedämpfte Licht erzählen selbst, warum Menschen wiederkommen.

## Der richtige Rhythmus

Am Vormittag ist es ruhig genug für ein Gespräch, aber nie vollkommen still. Tassen klirren, Seiten rascheln, die Tür öffnet sich regelmäßig.

Das Jelinek eignet sich nicht für Eile. Genau darin liegt seine Stärke.`,
    readingTime: 4,
    publishedAt: new Date("2026-09-08T09:00:00.000Z"),
    sectionSlug: "locations",
    categorySlug: "stadtleben",
    tagSlugs: ["wien", "stadt"],
    placeSlug: "cafe-jelinek",
  },
  {
    title: "Karmelitermarkt: Frühstück zwischen Marktstand und Nachbarschaft",
    slug: "crash-test-karmelitermarkt",
    subtitle: "Drei Adressen, ein Markt und kein Grund für Eile.",
    excerpt:
      "Wo der zweite Bezirk am Wochenende früh wach wird und ein Frühstück leicht bis zum Mittag dauert.",
    content: `# Frühstück am Karmelitermarkt

Der Markt ist überschaubar genug, um nicht zur Kulisse zu werden. Händlerinnen, Stammgäste und Besucher teilen denselben engen Raum.

## Mehr als ein einzelnes Lokal

Die interessante Route führt nicht nur an einen Tisch. Sie beginnt bei den Marktständen und endet dort, wo gerade noch ein Platz frei ist.

Für einen langsamen Samstagvormittag ist das eine der verlässlichsten Adressen der Leopoldstadt.`,
    readingTime: 5,
    publishedAt: new Date("2026-09-07T08:30:00.000Z"),
    sectionSlug: "locations",
    categorySlug: "stadtleben",
    tagSlugs: ["wien", "menschen", "stadt"],
    placeSlug: "karmelitermarkt",
  },
  {
    title: "WUK: Was in einer ehemaligen Lokomotivfabrik alles Platz findet",
    slug: "crash-test-wuk",
    subtitle: "Konzerte, Werkstätten und politische Kultur unter einem Dach.",
    excerpt:
      "Das WUK ist kein einzelner Veranstaltungsort, sondern eine kleine Stadt aus Bühnen, Höfen und Arbeitsräumen.",
    content: `# Ein Haus mit vielen Eingängen

Wer das WUK nur wegen eines Konzerts besucht, sieht zunächst einen Ausschnitt. Hinter den sichtbaren Bühnen liegen Werkstätten, Initiativen und Räume für Bildung.

## Ein Ort, der Widersprüche aushält

Das Gebäude wirkt gleichzeitig improvisiert und dauerhaft. Genau diese Spannung macht seinen Charakter aus.

Am besten funktioniert ein Besuch, wenn vor oder nach der Veranstaltung genug Zeit für den Innenhof bleibt.`,
    readingTime: 5,
    publishedAt: new Date("2026-09-06T18:00:00.000Z"),
    sectionSlug: "locations",
    categorySlug: "kultur",
    tagSlugs: ["wien", "kultur", "stadt"],
    placeSlug: "wuk",
  },
];

async function main() {
  const author =
    (await prisma.author.findFirst({
      where: {
        name: {
          contains: "Dariia",
          mode: "insensitive",
        },
      },
    })) ??
    (await prisma.author.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    })) ??
    (await prisma.author.create({
      data: {
        name: "Dariia Skrypnyk",
        bio: "Journalistin und Gründerin von DORIDA.",
      },
    }));

  const sections = await Promise.all(
    sectionSeeds.map((section) =>
      prisma.section.upsert({
        where: {
          slug: section.slug,
        },
        update: {
          name: section.name,
          navigationOrder: section.navigationOrder,
          isVisible: true,
        },
        create: section,
      }),
    ),
  );

  const categories = await Promise.all(
    categorySeeds.map((category) =>
      prisma.category.upsert({
        where: {
          slug: category.slug,
        },
        update: {
          name: category.name,
        },
        create: category,
      }),
    ),
  );

  const tags = await Promise.all(
    tagSeeds.map((tag) =>
      prisma.tag.upsert({
        where: {
          slug: tag.slug,
        },
        update: {
          name: tag.name,
        },
        create: tag,
      }),
    ),
  );

  const locationTypes = await Promise.all(
    locationTypeSeeds.map((locationType) =>
      prisma.locationType.upsert({
        where: {
          slug: locationType.slug,
        },
        update: {
          name: locationType.name,
          icon: locationType.icon,
          navigationOrder: locationType.navigationOrder,
          isVisible: true,
        },
        create: locationType,
      }),
    ),
  );

  const locationTypeIds = new Map<string, string>(
    locationTypes.map((locationType) => [locationType.slug, locationType.id]),
  );

  const places = await Promise.all(
    placeSeeds.map((place) => {
      const typeId = locationTypeIds.get(place.typeSlug);

      if (!typeId) {
        throw new Error(`Missing seeded location type: ${place.typeSlug}`);
      }

      return prisma.place.upsert({
        where: {
          slug: place.slug,
        },
        update: {
          name: place.name,
          typeId,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          isVisible: true,
        },
        create: {
          name: place.name,
          slug: place.slug,
          typeId,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          isVisible: true,
        },
      });
    }),
  );

  const categoryIds = new Map<string, string>(
    categories.map((category) => [category.slug, category.id]),
  );
  const sectionIds = new Map<string, string>(
    sections.map((section) => [section.slug, section.id]),
  );
  const tagIds = new Map<string, string>(
    tags.map((tag) => [tag.slug, tag.id]),
  );
  const placeIds = new Map<string, string>(
    places.map((place) => [place.slug, place.id]),
  );

  for (const article of articleSeeds) {
    const sectionId = sectionIds.get(article.sectionSlug);

    if (!sectionId) {
      throw new Error(`Missing seeded section: ${article.sectionSlug}`);
    }

    const categoryId = article.categorySlug
      ? categoryIds.get(article.categorySlug)
      : null;
    const articleTagIds = article.tagSlugs.map((slug) => {
      const tagId = tagIds.get(slug);

      if (!tagId) {
        throw new Error(`Missing seeded tag: ${slug}`);
      }

      return tagId;
    });
    const placeId = article.placeSlug
      ? placeIds.get(article.placeSlug)
      : null;

    if (article.placeSlug && !placeId) {
      throw new Error(`Missing seeded place: ${article.placeSlug}`);
    }

    const articleData = {
      title: article.title,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      content: article.content,
      readingTime: article.readingTime,
      status: "PUBLISHED" as const,
      publishedAt: article.publishedAt,
      authorId: author.id,
      sectionId,
      categoryId,
      placeId,
    };
    const articleTags = articleTagIds.map((tagId) => ({
      tag: {
        connect: {
          id: tagId,
        },
      },
    }));

    await prisma.article.upsert({
      where: {
        slug: article.slug,
      },
      update: {
        ...articleData,
        tags: {
          deleteMany: {},
          create: articleTags,
        },
      },
      create: {
        ...articleData,
        slug: article.slug,
        tags: {
          create: articleTags,
        },
      },
    });
  }

  console.log(
    `Homepage crash-test data ready: ${articleSeeds.length} published articles, ${sections.length} sections, ${places.length} places, ${categories.length} categories, ${tags.length} tags. Author: ${author.name}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
