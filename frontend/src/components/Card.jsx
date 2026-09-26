export default function Card({ title, children, className = '' }) {
  return (
    <section className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      {children}
    </section>
  )
}
