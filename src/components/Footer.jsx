export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 bg-[#161616]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black">
              <span className="text-[#cc3c69]">She</span><span className="text-white">maxx</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse" />
          </div>

          <div className="flex items-center gap-8 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white/60 transition-colors">Conditions d'utilisation</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>

          <p className="text-xs text-white/20">
            © {year} Shemaxx. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
