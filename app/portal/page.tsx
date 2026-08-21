export default function Portal() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold">Mock EPFO Portal</h1>
      <p className="mt-4 text-gray-400">
        Phase 1 target: a deliberately hostile mock portal replaying the documented failure
        sequence — login friction &rarr; claim &rarr; limbo &rarr; false rejection &rarr;
        invalid grievance ID &rarr; 30-day lockout. All data synthetic.
      </p>
      <p className="mt-4 text-sm text-gray-500">Status: scaffolded, awaiting Phase 1.</p>
    </main>
  );
}
