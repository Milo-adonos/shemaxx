export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 bg-[#0d0d0d]">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black">
              <span style={{ color: '#cc3c69' }}>She</span><span style={{ color: '#ffffff' }}>maxx</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#cc3c69] animate-pulse" />
          </div>

          <div className="flex items-center gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors py-1">Confidentialité</a>
            <a href="#" className="hover:text-white/60 transition-colors py-1">Conditions</a>
            <a href="#" className="hover:text-white/60 transition-colors py-1">Contact</a>
          </div>

          <p className="text-xs text-white/20">© {year} Shemaxx</p>
        </div>
      </div>
    </footer>
  )
}
