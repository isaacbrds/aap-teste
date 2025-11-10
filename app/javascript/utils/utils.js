// utils/utils.js
export class Utils {
  constructor() {
    console.log("Utils inicializado")
  }

  // ===== FORMATAÇÃO DE DATAS E HORÁRIOS =====
  
  formatTime(dateString) {
    if (!dateString) return '--:--'
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  formatDate(dateString) {
    if (!dateString) return '--/--/----'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  formatDateTime(dateString) {
    if (!dateString) return '--/--/---- --:--'
    const date = new Date(dateString)
    return `${this.formatDate(dateString)} ${this.formatTime(dateString)}`
  }

  // ===== FORMATAÇÃO DE ARQUIVOS =====
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // ===== VALIDAÇÕES =====
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== ''
  }

  validateUrl(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // ===== MANIPULAÇÃO DE STRINGS =====
  
  sanitizeInput(input) {
    if (typeof input !== 'string') return input
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove caracteres perigosos básicos
  }

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  capitalize(text) {
    if (!text) return ''
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  // ===== UTILITÁRIOS DE ARRAY =====
  
  removeDuplicates(array, key = null) {
    if (!key) {
      return [...new Set(array)]
    }
    
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }

  sortByProperty(array, property, ascending = true) {
    return [...array].sort((a, b) => {
      const valueA = a[property]
      const valueB = b[property]
      
      if (valueA < valueB) return ascending ? -1 : 1
      if (valueA > valueB) return ascending ? 1 : -1
      return 0
    })
  }

  // ===== UTILITÁRIOS DE PERFORMANCE =====
  
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  throttle(func, limit) {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // ===== UTILITÁRIOS DOM =====
  
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag)
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value
      } else if (key === 'innerHTML') {
        element.innerHTML = value
      } else {
        element.setAttribute(key, value)
      }
    })
    
    if (content) {
      element.textContent = content
    }
    
    return element
  }

  // ===== UTILITÁRIOS DE DADOS =====
  
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => this.deepClone(item))
    if (typeof obj === 'object') {
      const clonedObj = {}
      Object.keys(obj).forEach(key => {
        clonedObj[key] = this.deepClone(obj[key])
      })
      return clonedObj
    }
  }

  isEmpty(value) {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }

  // ===== UTILITÁRIOS ESPECÍFICOS DO PROJETO =====
  
  extractSpeakers(activities) {
    return this.removeDuplicates(
      activities
        .map(activity => activity.speaker)
        .filter(speaker => 
          speaker && 
          !speaker.toLowerCase().includes('intervalo') && 
          !speaker.toLowerCase().includes('coffee')
        )
    )
  }

  calculateEventDuration(startDate, endDate) {
    if (!startDate || !endDate) return null
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end - start
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return { days, hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) }
  }

  generateEventSlug(eventName) {
    return this.slugify(eventName)
  }

  // ===== MÉTODOS DE DEBUG =====
  
  log(message, data = null) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Utils] ${message}`, data || '')
    }
  }

  logError(message, error = null) {
    console.error(`[Utils Error] ${message}`, error || '')
  }

  // ===== CONSTANTES ÚTEIS =====
  
  get CONSTANTS() {
    return {
      MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
      ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      DATE_FORMATS: {
        BR: 'pt-BR',
        US: 'en-US'
      },
      DEBOUNCE_DELAY: 300,
      THROTTLE_DELAY: 100
    }
  }
}
