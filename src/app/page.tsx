import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Shop } from "@/components/sections/shop";
import { Brand } from "@/components/sections/brand";
import { Testimonials } from "@/components/sections/testimonials";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Shop />
      <Brand />
      <Testimonials />
      <About />
      <Contact />
      <CTA />
    </>
  );
}
