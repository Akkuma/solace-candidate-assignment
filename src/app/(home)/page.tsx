"use client";

import { AdvocatesTable } from "./advocates-table";

export default function Home() {
  return (
    <main className="m-6">
      <h1 className="mb-4">Solace Advocates</h1>
      <AdvocatesTable />
    </main>
  );
}
