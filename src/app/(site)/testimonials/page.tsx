import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { TestimonialCard } from "@/components/realestate/Cards";
import { CtaBand } from "@/components/site/CtaBand";
import { getPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Client Reviews & Testimonials",
  description: "What buyers, sellers, landlords and investors say about working with Nadeem Khan.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const content = await getPage("testimonials");
  return (
    <>
      <PageHeader eyebrow={content.eyebrow} title={content.heading} text={content.intro} />
      <section className="container-site py-14 lg:py-20">
        {content.testimonials.length === 0 ? (
          <p className="border border-line bg-white px-6 py-14 text-center text-ink/75">Client reviews will appear here soon.</p>
        ) : (
          <ul className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>li]:mb-6">
            {content.testimonials.map((t, i) => (
              <li key={i} className="break-inside-avoid">
                <TestimonialCard t={t} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <CtaBand heading="Ready to work together?" buttonLabel="Contact Nadeem" buttonHref="/contact" />
    </>
  );
}
