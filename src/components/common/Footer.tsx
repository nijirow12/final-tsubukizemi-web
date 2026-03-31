export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#e2e8f0]">
      <div className="px-6 md:px-12 py-8 text-center">
        <small className="text-[0.72rem] tracking-[0.2em] uppercase text-[#b0b8c4]">
          &copy; {new Date().getFullYear()} TSUBUKI SEMINAR
        </small>
      </div>
    </footer>
  )
}
