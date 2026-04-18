import { Sparkles, Shield, Award, Users, Globe, TrendingUp, Phone, Mail, MapPin, Clock, CheckCircle, Target } from 'lucide-react'
import { Badge, Card, Button } from '../components/ui'

const teamMembers = [
  {
    name: '张明远',
    title: '创始人 & CEO',
    desc: '并购行业资深专家，深耕行业二十余年，曾任多家投资集团高管',
    avatar: 'Z',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: '李芳华',
    title: '首席技术官',
    desc: 'AI与大数据专家，主导开发智能并购匹配系统',
    avatar: 'L',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    name: '王建国',
    title: '并购顾问总监',
    desc: '资深投行背景，主导完成10+并购项目，累计交易金额过亿元',
    avatar: 'W',
    color: 'from-violet-500 to-violet-600',
  },
  {
    name: '陈思远',
    title: '行业研究总监',
    desc: '并购行业研究专家，深度研究行业趋势与标的企业',
    avatar: 'C',
    color: 'from-orange-500 to-orange-600',
  },
]

const milestones = [
  { year: '2023', event: '公司成立，深耕并购行业' },
  { year: '2024', event: '完成首笔并购顾问项目' },
  { year: '2024', event: 'AI智能匹配系统上线' },
  { year: '2025', event: '标的库突破200个项目' },
  { year: '2025', event: '行业专家网络扩展至100+人' },
  { year: '2026', event: '累计完成10+并购案例' },
]

const cooperation = [
  { label: 'PE/VC投资机构', count: '80+' },
  { label: '上市公司', count: '60+' },
  { label: '产业资本', count: '40+' },
  { label: '行业专家', count: '100+' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-secondary to-dark py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-20 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge variant="primary" className="mb-6 inline-flex items-center gap-2 px-4 py-1.5">
              <Sparkles size={14} />
              <span>关于我们</span>
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              深耕并购行业
              <span className="block text-accent">十余年</span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              我们是专业的并购服务平台，致力于为企业提供全方位的并购服务，助力产业整合与发展。
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: Shield, title: '技术驱动', desc: 'AI技术+行业专家双轮驱动' },
              { icon: TrendingUp, title: '资本赋能', desc: '深度链接资本与产业资源' },
              { icon: Globe, title: '资源整合', desc: '500+优质标的+100+行业专家' },
            ].map((item, i) => (
              <Card key={i} padding="lg" className="bg-white/10 backdrop-blur-sm border border-white/20 text-center hover:bg-white/15 transition-all">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon size={28} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
                <Target size={14} />
                <span>公司简介</span>
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                专业的
                <span className="gradient-text"> 并购服务平台</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  我们成立于2023年，是国内领先的并购服务平台。
                  公司汇聚了一批深耕并购行业多年的专业人士，结合人工智能技术，
                  为企业提供从标的筛选、尽职调查到交易完成的全流程服务。
                </p>
                <p>
                  我们深知并购市场的独特性——企业管理水平、技术壁垒、
                  市场份额等都是评估标的核心要素。我们的专业团队和AI系统
                  能够精准把握这些行业特点，为客户找到最匹配的并购标的。
                </p>
                <p>
                  多年来，我们已成功帮助10余家企业完成并购整合，
                  累计交易金额过亿元，赢得了业界的广泛认可。
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {cooperation.map((item, i) => (
                  <div key={i} className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-5">
                    <p className="text-3xl font-bold text-primary mb-1">{item.count}</p>
                    <p className="text-sm text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
              <Card padding="lg" className="relative shadow-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  发展历程
                </h3>
                <div className="space-y-6">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                        {m.year}
                      </div>
                      <div className="flex-1 pt-3">
                        <p className="text-gray-700 font-medium">{m.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
              <Users size={14} />
              <span>核心团队</span>
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              专业团队
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              汇聚行业资深专家与科技人才，为您提供全方位的专业服务
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <Card key={i} padding="lg" className="text-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-2">
                <div className={`w-20 h-20 bg-gradient-to-br ${member.color} rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg`}>
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-accent text-sm mb-3">{member.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{member.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Model */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
              <Award size={14} />
              <span>服务模式</span>
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              四大服务模式
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              全方位满足各行业并购需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: '并购顾问', desc: '专业团队全程服务，从需求诊断到整合赋能，提供一站式顾问服务' },
              { icon: Globe, title: '并购经纪', desc: '精准匹配买卖双方需求，促成双方达成并购交易' },
              { icon: Target, title: '并购标的', desc: '500+优质并购标的项目的专业项目库' },
              { icon: TrendingUp, title: '并购资讯', desc: '各行业最新动态、政策解读与趋势分析' },
            ].map((service, i) => (
              <Card key={i} padding="lg" className="text-center hover:shadow-xl hover:-translate-y-2 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <service.icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card padding="lg" className="shadow-xl">
            <div className="text-center mb-10">
              <Badge variant="primary" className="mb-4 inline-flex items-center gap-2">
                <Phone size={14} />
                <span>联系我们</span>
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                开启您的并购之旅
              </h2>
              <p className="text-gray-600">
                欢迎联系我们，专业团队将为您提供咨询服务
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Phone size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">联系电话</p>
                  <p className="font-bold text-gray-900">400-888-8888</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">电子邮箱</p>
                  <p className="font-bold text-gray-900">contact@yingzhitai.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin size={22} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">公司地址</p>
                  <p className="font-bold text-gray-900">上海市浦东新区</p>
                </div>
              </div>
            </div>

            <Button variant="primary" className="w-full py-4 text-lg shadow-lg">
              立即咨询
            </Button>
          </Card>
        </div>
      </section>
    </div>
  )
}
