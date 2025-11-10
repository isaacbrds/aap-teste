// managers/event_data_manager.js
export class EventDataManager {
  constructor(controller) {
    this.controller = controller
    this.utils = controller.utils
    this.storageKey = 'eventData'
    console.log("EventDataManager inicializado")
  }

  // ===== SALVAMENTO DE DADOS =====
  
  saveEventData() {
    const form = this.getEventForm()
    if (!form) {
      this.utils.logError("Formulário não encontrado")
      return false
    }

    const formData = new FormData(form)
    const eventData = this.processFormData(formData)
    
    // Processa banner separadamente
    this.processBannerData(form, eventData)
    
    // Salva no sessionStorage
    const saved = this.saveToStorage(eventData)
    
    if (saved) {
      this.utils.log('Dados do evento salvos:', eventData)
      this.triggerDataSavedEvent(eventData)
    }
    
    return saved
  }

  loadEventData() {
    const eventData = this.getFromStorage()
    if (!eventData || this.utils.isEmpty(eventData)) {
      this.utils.log("Nenhum dado de evento para carregar")
      return false
    }

    const form = this.getEventForm()
    if (!form) {
      this.utils.logError("Formulário não encontrado para carregar dados")
      return false
    }

    this.populateForm(form, eventData)
    this.utils.log('Dados do evento carregados')
    return true
  }

  // ===== PROCESSAMENTO DE DADOS =====
  
  processFormData(formData) {
    const eventData = {}
    
    // Processa campos normais (exceto arquivos)
    formData.forEach((value, key) => {
      if (key !== 'event[banner]' && key !== 'authenticity_token') {
        const cleanKey = this.cleanFieldKey(key)
        const cleanValue = this.sanitizeFieldValue(value, cleanKey)
        
        if (cleanValue !== null) {
          eventData[cleanKey] = cleanValue
        }
      }
    })

    // Adiciona metadados
    eventData.lastModified = new Date().toISOString()
    eventData.version = this.getDataVersion()
    
    return eventData
  }

  processBannerData(form, eventData) {
    const bannerInput = form.querySelector('input[name="event[banner]"]')
    
    if (bannerInput && bannerInput.files.length > 0) {
      const file = bannerInput.files[0]
      
      // Valida o arquivo
      if (!this.validateBannerFile(file)) {
        return false
      }
      
      // Guarda arquivo na propriedade do controller
      this.controller.setState({ originalBannerFile: file })
      
      // Cria URL para preview
      const imageUrl = URL.createObjectURL(file)
      
      // Adiciona dados do banner ao eventData
      console.log(imageUrl);
      eventData.bannerUrl = imageUrl
      eventData.bannerName = file.name
      eventData.bannerSize = file.size
      eventData.bannerType = file.type
      eventData.hasBanner = true
      
      this.utils.log('Banner processado:', {
        name: file.name,
        size: this.utils.formatFileSize(file.size),
        type: file.type
      })
      
      return true
    } else {
      // Remove dados de banner se não há arquivo
      eventData.hasBanner = false
      this.controller.setState({ originalBannerFile: null })
      this.cleanupBannerUrls(eventData)
      return false
    }
  }

  populateForm(form, eventData) {
    Object.entries(eventData).forEach(([key, value]) => {
      // Pula campos que são só para o frontend
      // if (this.isFrontendOnlyField(key)) {
      //   return
      // }
      
      const input = form.querySelector(`[name="event[${key}]"]`)
      if (input && value !== null && value !== undefined) {
        this.setInputValue(input, value)
      }
    })
  }

  // ===== VALIDAÇÕES =====
  
  validateEventData(eventData = null) {
    const data = eventData || this.getEventData()
    const errors = []

    // Validações obrigatórias
    const requiredFields = this.getRequiredFields()
    requiredFields.forEach(field => {
      if (!this.utils.validateRequired(data[field.key])) {
        errors.push(`${field.label} é obrigatório`)
      }
    })

    // Validações específicas
    if (data.email && !this.utils.validateEmail(data.email)) {
      errors.push('Email deve ter um formato válido')
    }

    if (data.period_start && data.period_end) {
      if (new Date(data.period_start) > new Date(data.period_end)) {
        errors.push('Data de início deve ser anterior à data de fim')
      }
    }

    // Validações de URLs se existirem
    const urlFields = ['website', 'facebook', 'instagram']
    urlFields.forEach(field => {
      if (data[field] && !this.utils.validateUrl(data[field])) {
        errors.push(`${field} deve ser uma URL válida`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors: errors,
      data: data
    }
  }

  validateBannerFile(file) {
    const maxSize = this.utils.CONSTANTS.MAX_FILE_SIZE
    const allowedTypes = this.utils.CONSTANTS.ALLOWED_IMAGE_TYPES

    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Máximo permitido: ${this.utils.formatFileSize(maxSize)}`)
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      alert(`Tipo de arquivo não permitido. Use: ${allowedTypes.join(', ')}`)
      return false
    }

    return true
  }

  // ===== STORAGE =====
  
  saveToStorage(eventData) {
    try {
      // const dataToSave = this.cleanDataForStorage(eventData)
      sessionStorage.setItem(this.storageKey, JSON.stringify(eventData))
      return true
    } catch (error) {
      this.utils.logError('Erro ao salvar no sessionStorage:', error)
      return false
    }
  }

  getFromStorage() {
    try {
      const dataString = sessionStorage.getItem(this.storageKey)
      if (!dataString) return {}
      
      const eventData = JSON.parse(dataString)
      return this.migrateDataIfNeeded(eventData)
    } catch (error) {
      this.utils.logError('Erro ao carregar do sessionStorage:', error)
      return {}
    }
  }

  clearStorage() {
    try {
      sessionStorage.removeItem(this.storageKey)
      this.cleanupBannerUrls()
      this.controller.setState({ originalBannerFile: null })
      this.utils.log('Storage do evento limpo')
      return true
    } catch (error) {
      this.utils.logError('Erro ao limpar storage:', error)
      return false
    }
  }

  // ===== MÉTODOS AUXILIARES =====
  
  getEventData() {
    return this.getFromStorage()
  }

  getEventForm() {
    return document.querySelector('form')
  }

  cleanFieldKey(key) {
    return key.replace(/^event\[/, '').replace(/\]$/, '')
  }

  sanitizeFieldValue(value, fieldKey) {
    if (value === null || value === undefined) return null
    
    // Sanitiza strings
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed === '') return null
      
      // Sanitização específica por tipo de campo
      switch(fieldKey) {
        case 'email':
          return trimmed.toLowerCase()
        case 'name':
        case 'responsable':
          return this.utils.capitalize(trimmed)
        default:
          return this.utils.sanitizeInput(trimmed)
      }
    }
    
    return value
  }

  setInputValue(input, value) {
    switch(input.type) {
      case 'checkbox':
        input.checked = Boolean(value)
        break
      case 'radio':
        if (input.value === value) {
          input.checked = true
        }
        break
      case 'select-one':
      case 'select-multiple':
        input.value = value
        break
      default:
        input.value = value
    }
  }

  isFrontendOnlyField(key) {
    const frontendFields = [
      'bannerUrl', 'bannerName', 'bannerSize', 'bannerType', 'hasBanner',
      'lastModified', 'version'
    ]
    return frontendFields.includes(key)
  }

  cleanDataForStorage(eventData) {
    const cleanData = { ...eventData }
    
    // Remove URLs temporárias para evitar vazamento de memória
    if (cleanData.bannerUrl && cleanData.bannerUrl.startsWith('blob:')) {
      delete cleanData.bannerUrl
    }
    
    return cleanData
  }

  cleanupBannerUrls(eventData = null) {
    const data = eventData || this.getEventData()
    
    if (data.bannerUrl && data.bannerUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(data.bannerUrl)
        this.utils.log('URL temporária do banner limpa')
      } catch (error) {
        this.utils.logError('Erro ao limpar URL temporária:', error)
      }
    }
  }

  // ===== CONFIGURAÇÕES =====
  
  getRequiredFields() {
    return [
      { key: 'name', label: 'Nome do evento' },
      { key: 'email', label: 'Email de contato' },
      { key: 'responsable', label: 'Responsável' },
      { key: 'local', label: 'Local do evento' },
      { key: 'period_start', label: 'Data de início' }
    ]
  }

  getDataVersion() {
    return '1.0.0'
  }

  migrateDataIfNeeded(eventData) {
    // Implementa migração de dados se necessário
    if (!eventData.version) {
      eventData.version = this.getDataVersion()
    }
    
    return eventData
  }

  // ===== EVENTOS =====
  
  triggerDataSavedEvent(eventData) {
    const event = new CustomEvent('eventDataSaved', {
      detail: { eventData: eventData }
    })
    document.dispatchEvent(event)
  }

  onDataSaved(callback) {
    document.addEventListener('eventDataSaved', callback)
  }

  // ===== EXPORTAÇÃO E IMPORTAÇÃO =====
  
  exportEventData() {
    const eventData = this.getEventData()
    const exportData = {
      event: eventData,
      exportedAt: new Date().toISOString(),
      version: this.getDataVersion()
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `evento_${eventData.name || 'sem_nome'}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    this.utils.log('Dados do evento exportados')
  }

  importEventData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result)
          
          if (importData.event) {
            this.saveToStorage(importData.event)
            this.loadEventData()
            resolve(importData.event)
          } else {
            reject(new Error('Formato de arquivo inválido'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
      reader.readAsText(file)
    })
  }

  // ===== MÉTODOS DE DEBUG =====
  
  debugEventData() {
    const eventData = this.getEventData()
    const validation = this.validateEventData(eventData)
    
    console.log("=== DEBUG EVENT DATA ===")
    console.log("Event data:", eventData)
    console.log("Validation:", validation)
    console.log("Storage size:", JSON.stringify(eventData).length, "chars")
    console.log("Has banner file:", !!this.controller.getState().originalBannerFile)
    console.log("=== END DEBUG ===")
  }

  // ===== UTILITÁRIOS ESPECÍFICOS =====
  
  getEventSummary() {
    const eventData = this.getEventData()
    
    return {
      name: eventData.name || 'Sem nome',
      period: this.formatEventPeriod(eventData),
      location: eventData.local || 'Local não definido',
      responsible: eventData.responsable || 'Responsável não definido',
      email: eventData.email || 'Email não definido',
      hasBanner: eventData.hasBanner || false,
      isValid: this.validateEventData(eventData).isValid
    }
  }

  formatEventPeriod(eventData) {
    if (!eventData.period_start) return 'Data não definida'
    
    const start = new Date(eventData.period_start)
    const end = eventData.period_end ? new Date(eventData.period_end) : null
    
    if (end && start.toDateString() === end.toDateString()) {
      return `${this.utils.formatDate(start)} das ${this.utils.formatTime(start)} às ${this.utils.formatTime(end)}`
    } else if (end) {
      return `${this.utils.formatDate(start)} a ${this.utils.formatDate(end)}`
    } else {
      return this.utils.formatDate(start)
    }
  }
}
