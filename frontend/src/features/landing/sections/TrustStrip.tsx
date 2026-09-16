import { trustStats } from '../landing.data'

export function TrustStrip() {
  return (
    <section className="border-b border-gray-100 bg-white py-12 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3 lg:gap-12 lg:px-6">
        {trustStats.map(({ icon: Icon, value, title, desc }) => (
          <div key={title} className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary-800">
              <Icon className="h-6 w-6" />
            </div>
            <p className="text-2xl tracking-tight text-gray-900 lg:text-3xl">{value}</p>
            <h3 className="mt-2 text-base text-gray-900">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
