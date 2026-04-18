import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { mockDashboardStats, mockRecentActivity } from '../data/mockData'
import useExcelDataStore from '../data/excelData'
import {
  Briefcase,
  DollarSign,
  Users,
  TrendingUp,
  Heart,
  ArrowRight,
  Database,
  Sparkles,
  Eye,
  Activity,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '../components/ui'

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const stats = [
    {
      icon: Briefcase,
      label: '总项目数',
      value: mockDashboardStats.totalDeals,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: DollarSign,
      label: '进行中项目',
      value: mockDashboardStats.activeDeals,
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Users,
      label: 'AI匹配成功',
      value: mockDashboardStats.matchedDeals,
      gradient: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
    },
    {
      icon: TrendingUp,
      label: '总交易金额',
      value: mockDashboardStats.totalValue,
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
    },
  ]

  const quickActions = [
    {
      icon: Users,
      title: 'AI觅售',
      subtitle: '智能匹配项目',
      href: '/ai-finder',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: DollarSign,
      title: 'AI估值',
      subtitle: '企业价值评估',
      href: '/ai-valuation',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Briefcase,
      title: '浏览项目',
      subtitle: '查看案件库',
      href: '/deals',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: Database,
      title: '数据管理',
      subtitle: '导入Excel数据',
      href: '/data-management',
      gradient: 'from-orange-500 to-amber-500',
    },
  ]

  const savedDeals = [
    { name: '上海生物医药', amount: '¥28亿', sector: '生物制药', time: '今天' },
    { name: '北京智云科技', amount: '¥15亿', sector: 'AI软件', time: '昨天' },
    { name: '苏州储能科技', amount: '¥12亿', sector: '新能源储能', time: '3天前' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              个人工作台
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的看板</h1>
          <p className="text-gray-600">欢迎回来！这里是您的个人工作台</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group relative bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 100 + 200}ms` }}
            >
              {/* Top gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />

              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="text-gray-700" size={22} />
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  #{index + 1}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>

              {/* Decorative element */}
              <div className={`absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full group-hover:opacity-10 transition-opacity duration-500`} />

              {/* Corner accent */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className={`lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 shadow-soft hover:shadow-soft-lg transition-shadow duration-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-900">快捷操作</h2>
                <Badge variant="primary" className="text-xs">常用功能</Badge>
              </div>
              <Link
                to="/ai-finder"
                className="text-sm text-primary font-medium flex items-center space-x-1 hover:text-accent transition-colors group"
              >
                <span>更多</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="group relative p-5 bg-gray-50 rounded-2xl hover:bg-gradient-to-br transition-all duration-300 overflow-hidden"
                  style={{ transitionDelay: `${index * 50 + 700}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative flex items-center space-x-4">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <action.icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1 group-hover:text-white transition-colors">
                      <p className="font-semibold text-gray-900 group-hover:text-white transition-colors">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors">
                        {action.subtitle}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* AI Activity Indicator */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Activity size={20} className="text-primary" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="text-sm text-gray-600">
                  AI系统运行正常 · <span className="text-primary font-medium">最近匹配: 5分钟前</span>
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`bg-white rounded-3xl p-6 lg:p-8 shadow-soft hover:shadow-soft-lg transition-shadow duration-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '700ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-900">最近动态</h2>
                <Badge variant="success" className="text-xs">实时更新</Badge>
              </div>
            </div>

            <div className="space-y-1">
              {mockRecentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                  style={{ transitionDelay: `${index * 50 + 800}ms` }}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Eye size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.action}
                      <span className="font-semibold"> {activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saved Deals */}
        <div className={`mt-8 bg-white rounded-3xl p-6 lg:p-8 shadow-soft hover:shadow-soft-lg transition-shadow duration-500 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ transitionDelay: '900ms' }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-gray-900">我的收藏</h2>
              <Badge variant="accent" className="flex items-center space-x-1">
                <Heart size={12} className="fill-current" />
                <span>3个项目</span>
              </Badge>
            </div>
            <Link
              to="/deals"
              className="flex items-center text-primary hover:text-accent font-medium group transition-colors"
            >
              <span>查看全部</span>
              <ArrowRight
                size={16}
                className="ml-1 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {savedDeals.map((deal, index) => (
              <div
                key={deal.name}
                className="group relative p-5 bg-gray-50 rounded-2xl hover:shadow-soft transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                style={{ transitionDelay: `${index * 50 + 1000}ms` }}
              >
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {deal.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {deal.name}
                      </p>
                      <p className="text-sm text-gray-500">{deal.sector}</p>
                    </div>
                  </div>
                  <Heart size={18} className="text-red-500 fill-current group-hover:scale-110 transition-transform" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                    {deal.amount}
                  </span>
                  <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full group-hover:shadow-sm transition-shadow">
                    {deal.time}
                  </span>
                </div>

                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
