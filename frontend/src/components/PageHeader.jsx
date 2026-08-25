export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-7">
      <p className="text-sm font-semibold text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
