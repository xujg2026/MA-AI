import { Search, Menu, X, Sparkles, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: '首页', href: '/' },
    { name: 'AI觅售', href: '/ai-finder' },
    { name: 'AI交易', href: '/buyer-matching' },
    { name: '并购资讯', href: '/news' },
    { name: '案例库', href: '/deals', desc: '既往交易' },
    { name: '数据管理', href: '/data-management' },
    { name: '关于我们', href: '/about' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-soft-lg py-2'
          : 'bg-gradient-to-r from-primary to-secondary py-3'
      }`}
    >
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                scrolled
                  ? 'bg-gradient-to-br from-primary to-secondary shadow-lg'
                  : 'bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
            >
              <Sparkles
                size={22}
                className={`transition-all duration-300 ${
                  scrolled ? 'text-white' : 'text-accent'
                } group-hover:scale-110 group-hover:rotate-12`}
              />
              <div className="absolute inset-0 rounded-xl bg-accent/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xl font-bold transition-colors ${
                  scrolled ? 'text-primary' : 'text-white'
                }`}
              >
                M&A AI
              </span>
              <span className={`text-[10px] font-medium tracking-wider transition-colors ${
                scrolled ? 'text-secondary' : 'text-white/60'
              }`}>
                智能并购平台
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? scrolled
                        ? 'bg-primary/10 text-primary'
                        : 'bg-white/20 text-white backdrop-blur-sm'
                      : scrolled
                      ? 'text-gray-600 hover:text-primary hover:bg-gray-100'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant={scrolled ? 'ghost' : 'ghost'}
              size="sm"
              className={`rounded-xl ${scrolled ? 'text-gray-600' : 'text-white bg-white/10 hover:bg-white/20'}`}
            >
              <Search size={18} />
            </Button>
            <Button
              variant="accent"
              size="sm"
              icon={Zap}
              className="rounded-xl"
            >
              登录
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2.5 rounded-xl transition-all duration-300 ${
              scrolled
                ? 'hover:bg-gray-100 text-gray-600'
                : 'hover:bg-white/10 text-white'
            }`}
          >
            {isOpen ? (
              <X size={24} className="transition-transform duration-300 rotate-90" />
            ) : (
              <Menu size={24} className="transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-soft-xl border-t border-gray-100 transition-all duration-300 origin-top ${
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-2">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 mt-4">
            <Button variant="accent" className="w-full" icon={Zap}>
              登录
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
