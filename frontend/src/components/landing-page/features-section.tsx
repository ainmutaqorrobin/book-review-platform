const features = [
  {
    id: "01",
    title: "Browse With Context",
    description:
      "Move through the collection with enough detail to decide what deserves your attention next.",
  },
  {
    id: "02",
    title: "Write Better Reviews",
    description:
      "Capture quick reactions, polished summaries, and clear ratings without losing your own voice.",
  },
  {
    id: "03",
    title: "Keep Discovery Useful",
    description:
      "Search titles, surface patterns, and turn AI assistance into a better reading archive instead of noise.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 text-left sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Why It Feels Different
          </p>
          <h2 className="font-[family-name:Georgia,serif] text-4xl leading-tight text-stone-900 sm:text-5xl">
            Less dashboard, more reading room.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-stone-600">
          The interface is built to help you think about books, not just manage
          records. Every surface should support memory, reflection, and better
          recommendation instincts.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature.id}
            className={`rounded-[2rem] border border-stone-900/10 p-6 shadow-[0_18px_40px_rgba(64,38,24,0.08)] ${
              index === 1
                ? "bg-[#201814] text-stone-100"
                : "bg-white/65 text-stone-900"
            }`}
          >
            <p
              className={`text-[11px] uppercase tracking-[0.3em] ${
                index === 1 ? "text-stone-400" : "text-stone-500"
              }`}
            >
              {feature.id}
            </p>
            <h3 className="mt-5 font-[family-name:Georgia,serif] text-3xl leading-tight">
              {feature.title}
            </h3>
            <p
              className={`mt-4 text-sm leading-7 ${
                index === 1 ? "text-stone-300" : "text-stone-600"
              }`}
            >
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
