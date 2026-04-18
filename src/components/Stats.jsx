import { ArrowUpRight, TrendingUp, TrendingDown, Briefcase, DollarSign, Building2, Shield, Award, Users } from 'lucide-react'
import { Card, Badge } from './ui'

const stats = [
  {
    icon: Shield,
    value: '500+',
    label: 'TIC行业标的',
    change: '+15%',
    positive: true,
    trend: 'up',
  },
  {
    icon: Award,
    value: '10+',
    label: '成功并购案例',
    change: '+8%',
    positive: true,
    trend: 'up',
  },
  {
    icon: Users,
    value: '100+',
    label: '行业专家网络',
    change: '+20%',
    positive: true,
    trend: 'up',
  },
  {
    icon: Building2,
    value: '200+',
    label: '合作机构',
    change: '+12%',
    positive: true,
    trend: 'up',
  },
]

export default function Stats() {
  return (
    <section className="py-20 -mt-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              padding="lg"
              className="group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Top accent line with animation */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />

              <div className="relative">
                {/* Icon with enhanced hover effect */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-glow-primary">
                  <stat.icon className="text-primary" size={26} />
                </div>

                {/* Value */}
                <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">
                  {stat.value}
                </p>

                {/* Label */}
                <p className="text-gray-500 text-sm mb-3">{stat.label}</p>

                {/* Change indicator */}
                <Badge
                  variant={stat.positive ? 'success' : 'warning'}
                  className="flex items-center space-x-1 group-hover:scale-105 transition-transform"
                >
                  {stat.positive ? (
                    <TrendingUp size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  ) : (
                    <TrendingDown size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                  )}
                  <span>{stat.change}</span>
                </Badge>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Hover corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
