import { Sparkles, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary via-secondary to-dark text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles size={24} className="text-primary" />
              </div>
              <span className="text-2xl font-bold">并购助手</span>
            </Link>
            <p className="text-white/70 mb-8 max-w-md leading-relaxed">
              专注于为企业并购提供智能解决方案，整合AI技术与专业资源，
              让并购交易更高效、更智能。
            </p>

            {/* Newsletter */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md">
              <h4 className="font-semibold mb-3">订阅更新</h4>
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="输入您的邮箱"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-accent"
                />
                <button className="px-6 py-3 bg-accent hover:bg-accent/90 text-primary font-semibold rounded-xl transition-all hover:-translate-y-0.5">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">快速链接</h4>
            <ul className="space-y-4">
              {[
                { name: 'AI觅售', href: '/ai-finder' },
                { name: 'AI估值', href: '/ai-valuation' },
                { name: 'AI推荐书', href: '/ai-due-diligence' },
                { name: '案件库', href: '/deals' },
                { name: '数据管理', href: '/data-management' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="inline-flex items-center space-x-2 text-white/70 hover:text-accent transition-colors group"
                  >
                    <span>{link.name}</span>
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">联系我们</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-white/70">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Phone size={18} />
                </div>
                <span>400-888-8888</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Mail size={18} />
                </div>
                <span>contact@ma-ai.com</span>
              </li>
              <li className="flex items-start space-x-3 text-white/70">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <span>北京市朝阳区建国门外大街1号</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex space-x-3 mt-8">
              {['微信', '微博', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-accent/20 rounded-xl flex items-center justify-center text-white/70 hover:text-accent transition-all hover:-translate-y-1"
                >
                  <span className="text-xs font-medium">{social}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-white/50 text-sm">
              © 2024 并购助手. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                隐私政策
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                服务条款
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                ICP备案
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
