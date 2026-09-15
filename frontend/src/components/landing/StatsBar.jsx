const stats = [
  { value: '0 hrs', label: 'spent manually sorting resumes' },
  { value: '100%', label: 'of candidates get a status update' },
  { value: 'Minutes', label: 'from application to ranked shortlist' },
];

function StatsBar() {
  return (
    <section className="bg-plum">
      <div className="mx-auto grid max-w-site grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-serif text-5xl font-bold text-gold">{stat.value}</p>
            <p className="mx-auto mt-2 max-w-[16rem] text-sm font-medium leading-snug text-ice/90">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsBar;
