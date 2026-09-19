import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <p>404</p>
      <h1>Diese Seite wurde nicht gefunden.</h1>
      <Link href="/">Zurück zu DORIDA</Link>
    </main>
  );
}
