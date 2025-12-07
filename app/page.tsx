// app/page.tsx
import HeroSection from '@/components/home/hero'
import ServicesSection from '@/components/home/services'
import WhyChooseUs from '@/components/home/why-choose-us'
//import Testimonials from '@/components/home/testimonials'
//import CTASection from '@/components/home/cta-section'

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <WhyChooseUs />
      {/* <Testimonials /> */}
      {/* <CTASection /> */}
    </>
  )
}