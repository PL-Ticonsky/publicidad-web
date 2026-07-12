export default function ProductLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#0b0d0e] px-5 py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)]">
        <div className="aspect-[4/3] rounded-2xl bg-zinc-900" />
        <div className="h-[640px] rounded-2xl bg-zinc-900" />
      </div>
    </main>
  );
}
