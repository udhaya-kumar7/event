// Hero.jsx
import React from "react";

const Hero = ({ searchQuery, setSearchQuery, category, setCategory }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-red-900 to-black text-white py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">Discover events, workshops, and experiences</h1>
            <p className="text-gray-300 text-lg mb-6">Find curated events nearby — follow the ones you love and never miss out.</p>

            <form onSubmit={(e) => { e.preventDefault(); /* parent will handle via searchQuery prop */ }} className="flex flex-col sm:flex-row gap-3 items-stretch">
              <input
                type="text"
                placeholder="Search events, venues, or creators"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full sm:w-48 px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All categories</option>
                <option value="music">Music</option>
                <option value="tech">Tech</option>
                <option value="food">Food</option>
                <option value="sports">Sports</option>
                <option value="wellness">Wellness</option>
              </select>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="text-sm px-3 py-1 rounded-full bg-white/6">Nearby</button>
              <button className="text-sm px-3 py-1 rounded-full bg-white/6">Today</button>
              <button className="text-sm px-3 py-1 rounded-full bg-white/6">This week</button>
              <button className="text-sm px-3 py-1 rounded-full bg-white/6">Free</button>
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            {/* Decorative hero panel — gradient + subtle image */}
            <div className="w-full h-64 rounded-2xl bg-gradient-to-br from-red-600 to-pink-500 shadow-xl overflow-hidden relative">
              <img src="/images/hero-events.jpg" alt="hero" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
