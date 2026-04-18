import { useState } from 'react'
import { Send, Bot, User, Lightbulb, Clock, ThumbsUp } from 'lucide-react'

const quickQuestions = [
  '如何评估一家科技公司的价值？',
  '尽职调查需要关注哪些财务指标？',
  '并购交易的一般流程是什么？',
  '如何判断标的是否值得投资？',
]

const mockResponses = {
  '如何评估一家科技公司的价值？':
    '评估科技公司通常采用以下方法：\n\n1. **DCF估值**：基于未来现金流折现，适合盈利稳定的公司\n2. **可比公司法**：参考同行业上市公司的市盈率、市销率\n3. **用户价值法**：对于早期科技公司，可参考单用户价值\n4. **专利技术评估**：评估核心技术的独特性和壁垒\n\n科技公司还需特别关注：技术团队稳定性、专利布局、产品化能力等。',
  '尽职调查需要关注哪些财务指标？':
    '财务尽调重点关注：\n\n1. **盈利能力**：毛利率、净利率、EBITDA\n2. **成长性**：收入增长率、用户增长\n3. **现金流**：经营现金流、自由现金流\n4. **资产质量**：应收账款周转、存货周转\n5. **负债情况**：资产负债率、流动比率\n\n建议关注近3-5年的财务数据变化趋势。',
  '并购交易的一般流程是什么？':
    '标准并购流程：\n\n1. **前期准备**：战略规划、目标筛选\n2. **初步接触**：保密协议、意向函\n3. **尽职调查**：财务、法务、业务、技术DD\n4. **估值谈判**：基于DD结果协商估值\n5. **合同签署**：SPA协议等法律文件\n6. **交割执行**：股权变更、款项支付\n7. **整合管理**：投后整合\n\n整个流程通常需要3-6个月。',
  '如何判断标的是否值得投资？':
    '判断投资价值的关键因素：\n\n1. **行业前景**：是否符合国家政策支持方向\n2. **竞争优势**：护城河是否足够深\n3. **团队能力**：核心团队的专业背景和稳定性\n4. **财务质量**：盈利模式是否可持续\n5. **估值合理性**：价格是否在合理区间\n6. **协同效应**：与收购方的战略协同性\n\n建议结合AI估值工具和行业专家意见综合判断。',
}

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = (question) => {
    const userQuestion = question || input
    if (!userQuestion.trim()) return

    const userMessage = { role: 'user', content: userQuestion, time: new Date().toLocaleTimeString() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const responseContent = mockResponses[userQuestion] || '抱歉，我需要更多上下文来回答您的问题。您可以尝试点击上面的快捷问题，或详细描述您的并购相关疑问。'
      const botMessage = {
        role: 'bot',
        content: responseContent,
        time: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-lg">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">M&A AI 咨询助手</h2>
            <p className="text-sm text-gray-200">7×24小时为您提供并购专业咨询</p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-500 mb-3">快捷问题：</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-full hover:border-primary hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Lightbulb size={14} />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">向我提问关于并购的问题</p>
            <p className="text-sm text-gray-400 mt-1">
              如：估值方法、尽职调查、交易流程等
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-4 rounded-xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center space-x-1 mt-2 text-xs ${msg.role === 'user' ? 'text-gray-200' : 'text-gray-400'}`}>
                  <Clock size={12} />
                  <span>{msg.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 px-4 py-3 rounded-xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-500">AI正在思考...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的并购问题..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>AI回答仅供参考，不构成投资建议</span>
          <span className="flex items-center space-x-1">
            <ThumbsUp size={12} />
            <span>对回答满意请点赞</span>
          </span>
        </div>
      </div>
    </div>
  )
}
