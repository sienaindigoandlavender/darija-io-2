import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "Darija Dictionary — 10,000 Moroccan Arabic Words, Free",
  description: "Free Moroccan Arabic dictionary. 10,000 Darija words, 1,500 phrases — with Arabic script, pronunciation, and cultural notes. The language 40 million Moroccans actually speak.",
  alternates: { canonical: "https://darija.io" },
};

export default function Home() {
  return (
    <>
      {/* Crawlable content for Googlebot — hidden visually but readable by search engines */}
      <div className="sr-only">
        <h1>Darija Dictionary — Free Moroccan Arabic Reference</h1>
        <p>
          The most comprehensive free Moroccan Arabic (Darija) dictionary online.
          10,000 words and 1,500 phrases with Arabic script, romanized pronunciation,
          English and French translations, and cultural notes. Organized across 33
          categories: greetings, food, family, slang, verbs, religion, crafts, and more.
        </p>
        <p>Learn how to say hello, thank you, goodbye, and 10,000 other words in Moroccan Arabic.</p>
        <p>Categories: Greetings · Food &amp; Drink · Family · Shopping · Health ·
           Slang · Verbs · Directions · Numbers · Time · Religion · Crafts ·
           Architecture · Nature · Animals · Clothing · Music · Emergency</p>
      </div>
      <HomeClient />
    </>
  );
}
