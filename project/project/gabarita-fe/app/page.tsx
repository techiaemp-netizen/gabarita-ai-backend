/**
 * Home page providing links to all demonstration pages. This page
 * serves as a navigation hub for verifying each API endpoint in the
 * backend. Users can click to view options, questions, payments and
 * profile pages, as well as check backend status.
 */
export default function Home() {
  return (
    <main className="p-6 max-w-2xl mx-auto space-y-3">
      <h1 className="text-3xl font-bold">Gabarita.AI — FE novo (prova viva)</h1>
      <ul className="list-disc pl-5">
        <li>
          <a className="underline" href="/status">
            /status
          </a>
        </li>
        <li>
          <a className="underline" href="/opcoes">
            /opcoes
          </a>
        </li>
        <li>
          <a className="underline" href="/opcoes/cargos/6">
            /opcoes/cargos/6
          </a>
        </li>
        <li>
          <a className="underline" href="/opcoes/blocos/Enfermeiro">
            /opcoes/blocos/Enfermeiro
          </a>
        </li>
        <li>
          <a className="underline" href="/questoes">
            /questoes
          </a>
        </li>
        <li>
          <a className="underline" href="/payments">
            /payments
          </a>
        </li>
        <li>
          <a className="underline" href="/perfil/u1">
            /perfil/u1
          </a>
        </li>
        <li>
          <a className="underline" href="/test-styles">
            /test-styles (Teste de CSS)
          </a>
        </li>
      </ul>
    </main>
  );
}