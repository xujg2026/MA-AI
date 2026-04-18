import Hero from '../components/home/Hero'
import Stats from '../components/Stats'
import FeaturedDeals from '../components/FeaturedDeals'
import AICapabilities from '../components/home/AICapabilities'
import ServiceProcess from '../components/home/ServiceProcess'
import CoreAdvantages from '../components/home/CoreAdvantages'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Stats />
      <CoreAdvantages />
      <AICapabilities />
      <ServiceProcess />
      <FeaturedDeals />
    </div>
  )
}
