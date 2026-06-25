const links = {
  Plateforme: ["Comment ça marche", "Tarifs", "Devenir freelance", "Blog"],
  Services: ["Design & Création", "Développement Web", "Vidéo & Audio", "Rédaction & Traduction"],
  Support: ["Centre d'aide", "Politique de confidentialité", "Conditions d'utilisation", "Contact"],
};

const socials = [
  {
    label: "Facebook",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  },
  {
    label: "Instagram",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
  },
  {
    label: "LinkedIn",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#09090b] text-zinc-400 relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      {/* Subtle bg accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Newsletter CTA */}
        <div className="py-12 border-b border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-black text-xl tracking-tight mb-1">Restez informé</h3>
              <p className="text-zinc-500 text-sm">Recevez les meilleures offres et nouveaux talents chaque semaine.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-sm outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                />
              </div>
              <button className="btn-shimmer shrink-0 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-0.5 mb-4 group">
              <span className="text-2xl font-black tracking-tight gradient-text">Pix</span>
              <span className="text-2xl font-black tracking-tight text-white">Raise</span>
            </a>
            <p className="text-sm leading-relaxed text-zinc-500 mb-6">
              La marketplace créative algérienne — talents, ressources, et opportunités.
            </p>

            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a key={s.label} href="#" aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-violet-600 text-zinc-500 hover:text-white border border-white/5 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white font-bold text-sm mb-4 tracking-wide">{group}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} PixRaise. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-xs">
            {["Confidentialité", "Conditions", "Cookies"].map((l) => (
              <a key={l} href="#" className="text-zinc-600 hover:text-zinc-300 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
