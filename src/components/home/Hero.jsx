import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Activity, Zap, Globe, ChevronDown, Shield, Award, Users, TrendingUp, Target, CheckCircle } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-dark">
        {/* Geometric shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/50 rounded-full blur-3xl animate-pulse-slow" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Additional decorative elements */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white/20 rounded-full animate-bounce-soft" />
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-accent/30 rounded-full animate-bounce-soft" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
              <Shield size={18} className="text-accent animate-pulse" />
              <span className="text-sm text-white/90 font-medium">深耕并购行业十余年</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-white">智能</span>
              <br />
              <span className="gradient-text-accent">并购专家</span>
            </h1>

            {/* Three Pillars */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Zap, text: '技术驱动' },
                { icon: TrendingUp, text: '资本赋能' },
                { icon: Globe, text: '资源整合' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <item.icon size={16} className="text-accent" />
                  <span className="text-sm text-white/90 font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <p className="text-lg text-white/80 leading-relaxed max-w-xl prose-lg">
              专注智能并购服务，专业项目库收录500+优质标的，100+行业专家网络，助您精准匹配、高效并购。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/ai-finder"
                className="group relative inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-accent to-amber-400 hover:from-amber-400 hover:to-accent text-primary font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-glow hover:shadow-xl hover:-translate-y-1 btn-press"
              >
                <span className="text-lg">AI觅售</span>
                <Zap size={20} className="group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <Link
                to="/prospect-entry"
                className="group inline-flex items-center justify-center space-x-2 border-2 border-white/30 hover:border-white/50 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 btn-press"
              >
                <span className="text-lg">录入项目</span>
                <Target size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-yellow-500 border-2 border-white flex items-center justify-center text-xs font-bold text-primary shadow-lg">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-white/70">200+ 机构信赖</span>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Card */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute -inset-6 bg-gradient-to-r from-accent/20 to-transparent rounded-3xl blur-2xl" />

            <div className="relative glass-card-dark backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Activity size={20} className="text-accent" />
                  </div>
                  <span className="text-white font-semibold">并购标的数据库</span>
                </div>
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">实时更新</span>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1" />
                </div>
              </div>

              {/* Main stat */}
              <div className="mb-8">
                <p className="text-white/60 text-sm mb-2">并购标的数量</p>
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl lg:text-6xl font-bold text-white">500+</span>
                  <span className="text-xl text-white/60">个</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">覆盖行业</span>
                  <span className="text-accent font-medium">85%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-gradient-to-r from-accent to-yellow-400 rounded-full relative transition-all duration-1000">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-glow animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Sub stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-accent" />
                    <p className="text-white/60 text-xs">行业专家</p>
                  </div>
                  <p className="text-2xl font-bold text-white">100+</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={14} className="text-accent" />
                    <p className="text-white/60 text-xs">合作机构</p>
                  </div>
                  <p className="text-2xl font-bold text-white">200+</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <Award size={16} className="text-accent" />
                  <span>智能并购一站式服务平台</span>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-soft-xl animate-bounce-soft cursor-pointer hover:shadow-soft-lg transition-shadow">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">已完成并购</p>
                  <p className="font-bold text-gray-900">10+</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-3 -left-3 bg-white rounded-xl px-3 py-2 shadow-soft animate-float-slow cursor-pointer hover:shadow-soft-lg transition-shadow">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles size={12} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-gray-700">AI匹配中...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center space-y-2 text-white/40 cursor-pointer hover:text-white/60 transition-colors">
          <span className="text-xs font-medium tracking-wider">向下滚动</span>
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}
