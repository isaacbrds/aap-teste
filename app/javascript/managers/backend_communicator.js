// managers/backend_communicator.js
export class BackendCommunicator {
  constructor(controller) {
    this.controller = controller
    this.utils = controller.utils
    this.apiEndpoint = '/admin/events'
    console.log("BackendCommunicator inicializado")
  }

  // ===== PUBLICAÇÃO DO EVENTO =====

  async publishEvent() {
    this.utils.log('Iniciando criação do evento...')

    // Validações pré-envio
    if (!this.validateAuthentication()) {
      return false
    }

    const eventData = this.controller.eventManager.getEventData()
    const activities = this.controller.activitiesManager.getActivities()

    if (!this.validateEventData(eventData)) {
      return false
    }

    // Mostra loading
    this.showLoadingState('publishEvent')

    try {
      // Prepara os dados para envio
      const payload = this.prepareEventPayload(eventData, activities)

      // Envia para o backend
      const result = await this.submitEventToBackend(payload)

      if (result.success) {
        this.handleSuccessResponse(result.data)
        return true
      } else {
        this.handleErrorResponse(result.error, result.response)
        return false
      }

    } catch (error) {
      this.utils.logError('Erro inesperado ao publicar evento:', error)
      this.handleUnexpectedError(error)
      return false
    } finally {
      this.hideLoadingState('publishEvent')
    }
  }

  // ===== SALVAR COMO RASCUNHO =====

  async saveDraft() {
    this.utils.log('Salvando como rascunho...')

    const eventData = this.controller.eventManager.getEventData()
    const activities = this.controller.activitiesManager.getActivities()

    // Validação mínima (só nome é obrigatório para rascunho)
    if (!eventData.name) {
      alert('Pelo menos o nome do evento é obrigatório para salvar como rascunho!')
      return false
    }

    this.showLoadingState('saveDraft')

    try {
      // Força status como draft
      const payload = this.prepareEventPayload(eventData, activities)
      payload.event.status = 'draft'

      const result = await this.submitEventToBackend(payload)

      if (result.success) {
        this.handleDraftSavedResponse(result.data)
        return true
      } else {
        this.handleErrorResponse(result.error, result.response)
        return false
      }

    } catch (error) {
      this.utils.logError('Erro ao salvar rascunho:', error)
      this.handleUnexpectedError(error)
      return false
    } finally {
      this.hideLoadingState('saveDraft')
    }
  }

  // ===== PREPARAÇÃO DOS DADOS =====

  prepareEventPayload(eventData, activities) {
    // Lista de campos válidos para o evento
    const validEventFields = [
      'name', 'email', 'responsable', 'local', 'period_start', 'period_end',
      'comission', 'txtEnter', 'txtAbout', 'primaryColor', 'secondaryColor', 'status'
    ]

    // Filtra apenas os campos válidos do evento
    const event = {}
    validEventFields.forEach(field => {
      if (eventData[field] !== undefined && eventData[field] !== null && eventData[field] !== '') {
        event[field] = eventData[field]
      }
    })

    // Adiciona status se não existir
    if (!event.status) {
      event.status = this.getEventStatus()
    }

    // Lista de campos válidos para atividades
    const validActivityFields = [
      'name', 'title', 'local', 'speaker', 'period_start', 'period_end',
      'certificate_hours', 'subscriptions_open'
    ]

    // Filtra apenas os campos válidos das atividades
    const event_activities_attributes = activities.map(activity => {
      const cleanActivity = {}
      validActivityFields.forEach(field => {
        if (activity[field] !== undefined && activity[field] !== null && activity[field] !== '') {
          // Converte subscriptions_open para boolean
          if (field === 'subscriptions_open') {
            cleanActivity[field] = activity[field] === 'true' || activity[field] === true
          } else {
            cleanActivity[field] = activity[field]
          }
        }
      })
      return cleanActivity
    })

    // IMPORTANTE: As atividades devem estar DENTRO do evento
    event.event_activities_attributes = event_activities_attributes

    this.utils.log('Payload preparado:', { event })

    return { event: event }
  }

  // ===== ENVIO PARA O BACKEND =====

  async submitEventToBackend(payload) {
    try {
      this.utils.log('Enviando payload para backend:', payload)

      const token = this.getCSRFToken()
      if (!token) {
        throw new Error('Token CSRF não encontrado')
      }

      const formData = this.buildFormData(payload)

      // Debug do FormData
      this.debugFormData(formData)

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': token,
          'Accept': 'application/json'
        },
        body: formData
      })

      const result = await this.parseResponse(response)

      return {
        success: response.ok,
        data: result,
        error: response.ok ? null : result,
        response: response
      }

    } catch (error) {
      this.utils.logError('Erro na comunicação com backend:', error)
      return {
        success: false,
        data: null,
        error: error,
        response: null
      }
    }
  }

  buildFormData(payload) {
    const formData = new FormData()

    // Adiciona dados básicos do evento
    const eventFields = [
      'name', 'email', 'responsable', 'local', 'period_start', 'period_end',
      'comission', 'txtEnter', 'txtAbout', 'primaryColor', 'secondaryColor', 'status'
    ]

    eventFields.forEach(key => {
      if (payload.event[key] !== undefined && payload.event[key] !== null && payload.event[key] !== '') {
        formData.append(`event[${key}]`, payload.event[key])
        this.utils.log(`Adicionando event[${key}]:`, payload.event[key])
      }
    })

    // Adiciona atividades no formato CORRETO
    if (payload.event.event_activities_attributes && payload.event.event_activities_attributes.length > 0) {
      payload.event.event_activities_attributes.forEach((activity, index) => {
        Object.keys(activity).forEach(key => {
          const value = activity[key]
          if (value !== null && value !== undefined && value !== '') {
            formData.append(`event[activities_attributes][${index}][${key}]`, value)
            this.utils.log(`Adicionando event[activities_attributes][${index}][${key}]:`, value)
          }
        })
      })
    }

    // Adiciona o arquivo de banner se existir
    const bannerFile = this.getBannerFile()
    if (bannerFile) {
      formData.append('event[banner]', bannerFile)
      this.utils.log('Arquivo de banner adicionado:', bannerFile.name)
    }

    return formData
  }

  // ===== TRATAMENTO DE RESPOSTAS =====

  handleSuccessResponse(result) {
    this.utils.log('Evento criado com sucesso:', result)

    // Limpa dados locais
    this.clearLocalData()

    // Verifica se o usuário virou manager
    let successMessage = `Evento "${result.event.name}" criado com sucesso!`

    if (result.user_role_changed) {
      successMessage += '\n\nParabéns! Você agora é um gerente de eventos.'
    }

    // Mostra mensagem de sucesso
    this.showSuccessMessage(result, successMessage)

    // Redireciona após alguns segundos
    this.scheduleRedirect(result)
  }

  handleDraftSavedResponse(result) {
    this.utils.log('Rascunho salvo com sucesso:', result)

    // Não limpa dados locais para rascunho
    this.showSuccessMessage(result, `Rascunho "${result.event.name}" salvo com sucesso!`)

    // Redireciona para edição
    setTimeout(() => {
      if (result.event && result.event.id) {
        window.location.href = `/admin/events/${result.event.id}/edit`
      }
    }, 2000)
  }

  handleErrorResponse(result, response) {
    this.utils.logError('Erro ao criar evento:', result)

    let errorMessage = 'Erro ao criar evento. Verifique os dados e tente novamente.'

    // Trata diferentes tipos de erro
    if (response) {
      switch (response.status) {
        case 403:
          errorMessage = 'Você não tem permissão para criar eventos. Entre em contato com o administrador.'
          break
        case 401:
          errorMessage = 'Sessão expirada. Faça login novamente.'
          this.handleSessionExpired()
          break
        case 422:
          errorMessage = this.formatValidationErrors(result)
          break
        case 500:
        case 502:
        case 503:
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.'
          break
        default:
          errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
    }

    // Se tem erros específicos no resultado
    if (result && result.errors) {
      errorMessage = this.formatValidationErrors(result)
    }

    this.showErrorMessage(errorMessage)
  }

  handleUnexpectedError(error) {
    let errorMessage = 'Erro inesperado. Tente novamente.'

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
    } else if (error.message) {
      errorMessage = `Erro: ${error.message}`
    }

    this.showErrorMessage(errorMessage)
  }

  handleSessionExpired() {
    // Redireciona para login após 2 segundos
    setTimeout(() => {
      window.location.href = '/users/sign_in'
    }, 2000)
  }

  // ===== VALIDAÇÕES =====

  validateAuthentication() {
    const csrfToken = this.getCSRFToken()

    if (!csrfToken) {
      alert('Sessão expirada. Você será redirecionado para fazer login.')
      this.handleSessionExpired()
      return false
    }

    return true
  }

  validateEventData(eventData) {
    const requiredFields = ['name', 'email', 'responsable', 'local']
    const missingFields = requiredFields.filter(field => !this.utils.validateRequired(eventData[field]))

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => this.translateFieldName(f)).join(', ')
      alert(`Preencha os campos obrigatórios: ${fieldNames}`)
      return false
    }

    if (!eventData.period_start) {
      alert('Defina a data de início do evento!')
      return false
    }

    // Validação de email
    if (eventData.email && !this.utils.validateEmail(eventData.email)) {
      alert('Email deve ter um formato válido!')
      return false
    }

    return true
  }

  // ===== MÉTODOS AUXILIARES =====

  getCSRFToken() {
    const tokenElement = document.querySelector('meta[name="csrf-token"]')
    return tokenElement ? tokenElement.getAttribute('content') : null
  }

  getBannerFile() {
    const state = this.controller.getState()
    return state.originalBannerFile || null
  }

  getEventStatus() {
    try {
      return this.controller.targets.eventStatus?.value || 'draft'
    } catch {
      return 'draft'
    }
  }

  async parseResponse(response) {
    try {
      const text = await response.text()
      return text ? JSON.parse(text) : {}
    } catch (parseError) {
      this.utils.logError('Erro ao parsear resposta JSON:', parseError)
      return { errors: ['Erro de comunicação com o servidor'] }
    }
  }

  formatValidationErrors(result) {
    if (!result.errors) return 'Erro de validação desconhecido'

    if (Array.isArray(result.errors)) {
      return 'Erros encontrados:\n' + result.errors.join('\n')
    }

    if (typeof result.errors === 'object') {
      const errors = Object.entries(result.details || result.errors)
        .map(([field, messages]) => {
          const fieldName = this.translateFieldName(field)
          const messageList = Array.isArray(messages) ? messages : [messages]
          return `${fieldName}: ${messageList.join(', ')}`
        })
        .join('\n')
      return 'Erros encontrados:\n' + errors
    }

    return result.errors.toString()
  }

  translateFieldName(field) {
    const translations = {
      'name': 'Nome',
      'email': 'Email',
      'responsable': 'Responsável',
      'local': 'Local',
      'period_start': 'Data de início',
      'period_end': 'Data de término',
      'comission': 'Comissão',
      'txtEnter': 'Texto de apresentação',
      'txtAbout': 'Sobre o evento',
      'primaryColor': 'Cor primária',
      'secondaryColor': 'Cor secundária',
      'banner': 'Banner',
      'activities': 'Atividades'
    }

    return translations[field] || field
  }

  // ===== INTERFACE VISUAL =====

  showLoadingState(action = 'publishEvent') {
    const buttonSelectors = {
      'publishEvent': '[data-action*="publishEvent"]',
      'saveDraft': '[data-action*="saveDraft"]'
    }

    const loadingTexts = {
      'publishEvent': 'Criando evento...',
      'saveDraft': 'Salvando rascunho...'
    }

    const button = document.querySelector(buttonSelectors[action])
    if (button) {
      button.disabled = true
      button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        ${loadingTexts[action]}
      `
    }
  }

  hideLoadingState(action = 'publishEvent') {
    const buttonSelectors = {
      'publishEvent': '[data-action*="publishEvent"]',
      'saveDraft': '[data-action*="saveDraft"]'
    }

    const originalTexts = {
      'publishEvent': '<i class="bi bi-rocket"></i> Publicar evento',
      'saveDraft': '<i class="bi bi-save"></i> Salvar rascunho'
    }

    const button = document.querySelector(buttonSelectors[action])
    if (button) {
      button.disabled = false
      button.innerHTML = originalTexts[action]
    }
  }

  showSuccessMessage(result, customMessage = null) {
    const message = customMessage || `Evento "${result.event.name}" criado com sucesso!`

    const successHtml = `
      <div class="alert alert-success alert-dismissible fade show position-fixed" 
           style="top: 20px; right: 20px; z-index: 9999; min-width: 350px;" 
           role="alert">
        <i class="bi bi-check-circle me-2"></i>
        <div>
          <strong>Sucesso!</strong><br>
          ${message.replace(/\n/g, '<br>')}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', successHtml)

    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      const alert = document.querySelector('.alert-success')
      if (alert) alert.remove()
    }, 5000)
  }

  showErrorMessage(message) {
    const errorHtml = `
      <div class="alert alert-danger alert-dismissible fade show position-fixed" 
           style="top: 20px; right: 20px; z-index: 9999; min-width: 350px;" 
           role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <div>
          <strong>Erro!</strong><br>
          ${message.replace(/\n/g, '<br>')}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `

    document.body.insertAdjacentHTML('beforeend', errorHtml)

    // Remove automaticamente após 8 segundos
    setTimeout(() => {
      const alert = document.querySelector('.alert-danger')
      if (alert) alert.remove()
    }, 8000)
  }

  // ===== LIMPEZA E REDIRECIONAMENTO =====

  clearLocalData() {
    // Limpa sessionStorage
    this.controller.eventManager.clearStorage()
    this.controller.activitiesManager.clearActivities()

    // Limpa estado do controller
    this.controller.setState({ 
      originalBannerFile: null,
      editingIndex: null 
    })

    this.utils.log('Dados locais limpos')
  }

  scheduleRedirect(result) {
    setTimeout(() => {
      if (result.event && result.event.id) {
        window.location.href = `/admin/events/${result.event.id}`
      } else {
        window.location.href = '/admin/events'
      }
    }, 2000)
  }

  // ===== MÉTODOS DE DEBUG =====

  debugFormData(formData) {
    this.utils.log('=== FORMDATA FINAL ===')
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        this.utils.log(`${key}: [File] ${value.name} (${this.utils.formatFileSize(value.size)})`)
      } else {
        this.utils.log(`${key}:`, value)
      }
    }
    this.utils.log('=== FIM FORMDATA ===')
  }

  debugBackendState() {
    const eventData = this.controller.eventManager.getEventData()
    const activities = this.controller.activitiesManager.getActivities()
    const bannerFile = this.getBannerFile()

    console.log("=== DEBUG BACKEND STATE ===")
    console.log("Event data:", eventData)
    console.log("Activities:", activities)
    console.log("Banner file:", bannerFile)
    console.log("CSRF Token:", this.getCSRFToken())
    console.log("API Endpoint:", this.apiEndpoint)
    console.log("=== END DEBUG ===")
  }

  // ===== FUNCIONALIDADES EXTRAS =====

  async testConnection() {
    try {
      const response = await fetch('/admin/events', {
        method: 'HEAD',
        headers: {
          'X-CSRF-Token': this.getCSRFToken()
        }
      })

      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexão OK' : `Erro ${response.status}`
      }
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: 'Erro de conexão'
      }
    }
  }

  async previewEvent() {
    // TODO: Implementar preview do evento
    alert('Funcionalidade de preview em desenvolvimento!')
  }
}
