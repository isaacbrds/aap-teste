// managers/activities_manager.js
export class ActivitiesManager {
  constructor(controller) {
    this.controller = controller
    this.utils = controller.utils
    this.storageKey = 'activities'
    console.log("ActivitiesManager inicializado")
  }

  // ===== MODAL DE ATIVIDADES =====
  
  openModal() {
    const modal = this.controller.activitiesModalTarget
    modal.classList.remove("hidden")
    
    const modalTitle = modal.querySelector('h2')
    const state = this.controller.getState()
    
    if (state.editingIndex !== null && state.editingIndex !== undefined) {
      modalTitle.textContent = 'Editar Atividade'
    } else {
      modalTitle.textContent = 'Adicionar Nova Atividade'
      this.clearModalFields()
    }
    
    // Foca no primeiro campo
    this.focusFirstField()
  }

  closeModal() {
    const modal = this.controller.activitiesModalTarget
    modal.classList.add("hidden")
    this.clearModalFields()
    this.controller.setState({ editingIndex: null })
  }

  clearModalFields() {
    const fields = this.getModalFields()
    
    Object.values(fields).forEach(field => {
      if (field) {
        field.value = ''
      }
    })
  }

  focusFirstField() {
    const fields = this.getModalFields()
    if (fields.name) {
      fields.name.focus()
    }
  }

  // ===== CRUD DE ATIVIDADES =====
  
  addActivity(event) {
    event.preventDefault()
    
    const activityData = this.getActivityDataFromModal()
    
    // Valida dados
    const validation = this.validateActivity(activityData)
    if (!validation.isValid) {
      alert('Erros encontrados:\n' + validation.errors.join('\n'))
      return false
    }

    let activities = this.getActivities()
    const state = this.controller.getState()
    
    if (state.editingIndex !== undefined && state.editingIndex !== null) {
      // Editando atividade existente
      this.utils.log('Editando atividade no índice:', state.editingIndex)
      activities[state.editingIndex] = activityData
      this.controller.setState({ editingIndex: null })
    } else {
      // Adicionando nova atividade
      this.utils.log('Adicionando nova atividade')
      activities.push(activityData)
    }
    
    if (this.saveActivities(activities)) {
      this.closeModal()
      this.renderActivitiesList()
      this.triggerActivitiesChangedEvent()
      this.utils.log('Atividade salva com sucesso')
      return true
    } else {
      alert('Erro ao salvar atividade!')
      return false
    }
  }

  editActivity(event) {
    // const index = parseInt(event.currentTarget.dataset.activityIndex)
    const index = Number(event.currentTarget?.dataset?.index ?? event.target?.dataset?.index)
    this.utils.log('Editando atividade no índice:', index)
    
    const activities = this.getActivities()
    
    if (!activities[index]) {
      this.utils.logError('Atividade não encontrada no índice:', index)
      alert('Erro: Atividade não encontrada!')
      return false
    }

    const activity = activities[index]
    this.utils.log('Dados da atividade:', activity)
    
    // Preenche o modal com os dados da atividade
    this.populateModalWithActivity(activity)
    
    // Marca que está editando
    this.controller.setState({ editingIndex: index })
    this.utils.log('Modo de edição ativado para índice:', index)
    
    this.openModal()

    this.renderActivitiesList();
    return true

  }

  removeActivity(event) {
    const index = Number(event.currentTarget?.dataset?.index ?? event.target?.dataset?.index)
    this.utils.log('Removendo atividade no índice:', index)
    
    if (!confirm('Tem certeza que deseja remover esta sessão?')) {
      return false
    }

    const activities = this.getActivities()
    
    if (!activities[index]) {
      this.utils.logError('Atividade não encontrada no índice:', index)
      alert('Erro: Atividade não encontrada!')
      return false
    }

    this.utils.log('Removendo atividade:', activities[index])
    activities.splice(index, 1)
    
    if (this.saveActivities(activities)) {
      this.renderActivitiesList()
      this.triggerActivitiesChangedEvent()
      this.utils.log('Atividade removida com sucesso')
      return true
    } else {
      alert('Erro ao remover atividade!')
      return false
    }
  }

  duplicateActivity(index) {
    const activities = this.getActivities()
    const activity = activities[index]
    
    if (!activity) {
      this.utils.logError('Atividade não encontrada para duplicar:', index)
      return false
    }

    // Cria cópia da atividade
    const duplicatedActivity = {
      ...activity,
      name: `${activity.name} (Cópia)`,
      title: `${activity.title} (Cópia)`
    }

    activities.push(duplicatedActivity)
    
    if (this.saveActivities(activities)) {
      this.renderActivitiesList()
      this.triggerActivitiesChangedEvent()
      this.utils.log('Atividade duplicada com sucesso')
      return true
    }
    
    return false
  }

  // ===== RENDERIZAÇÃO =====
  
  renderActivitiesList() {
    
    if (!this.controller.hasActivitiesContainerTarget) {
      console.warn("[ActivitiesManager] activitiesContainerTarget não encontrado")
      return
    }

    const container = this.controller.activitiesContainerTarget
    const activities = this.getActivities()
    
    this.utils.log('Renderizando', activities.length, 'atividades')
    
    container.innerHTML = ""
    
    if (!activities || activities.length === 0) {
      this.renderEmptyState(container)
    } else {
      this.renderActivitiesItems(container, activities)
    }
    
    // Atualiza outros componentes
    // this.updateSpeakersList()
    // this.updatePreview()
    // ✅ ADICIONA EVENT LISTENERS APÓS RENDERIZAR
    this.attachEventListeners(container)

    if (this.controller.hasSummarySessionsCountTarget) {
      this.controller.summarySessionsCountTarget.textContent = String(activities.length)
    }
    console.log("chamando updateSpeakersList() e updatePreview()")
    this.updateSpeakersList()
    this.updatePreview()

  }

  // ✅ NOVO MÉTODO: Adiciona listeners aos botões dinâmicos
  attachEventListeners(container) {
    // Editar
    container.querySelectorAll(".activity-edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        console.log("[ActivitiesManager] Edit clicked, index:", btn.dataset.index)
        this.editActivity(e)
      })
    })

    // Duplicar
    container.querySelectorAll(".activity-duplicate-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        console.log("[ActivitiesManager] Duplicate clicked, index:", btn.dataset.index)
        this.duplicateActivity(e)
      })
    })

    // Remover
    container.querySelectorAll(".activity-remove-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        console.log("[ActivitiesManager] Remove clicked, index:", btn.dataset.index)
        this.removeActivity(e)
      })
    })
  }

  renderEmptyState(container) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-calendar-x text-muted" style="font-size: 2rem;"></i>
        <p class="text-muted mt-2">Nenhuma atividade adicionada ainda.</p>
        <button type="button" class="btn btn-outline-primary" data-action="event-form#openModal">
          <i class="bi bi-plus-circle"></i> Adicionar primeira atividade
        </button>
      </div>
    `
  }

  renderActivitiesItems(container, activities) {
    // Ordena por horário
    const sortedActivities = this.sortActivitiesByTime(activities)
    
    sortedActivities.forEach((activity, index) => {
      const sessionItem = this.createSessionItem(activity, index)
      container.appendChild(sessionItem)
    })
  }

  createSessionItem(activity, index) {
    const div = document.createElement('div')
    const isInterval = this.isIntervalActivity(activity)
    
    div.className = `session-item ${isInterval ? 'interval' : ''}`
    div.innerHTML = this.getSessionItemHTML(activity, index, isInterval)
    
    return div
  }

  getSessionItemHTML(activity, index, isInterval) {
    return `
      <div class="session-time">
        ${this.utils.formatTime(activity.period_start)}
      </div>
      <div class="session-content">
        <div class="session-title">${activity.name || activity.title || 'Sessão sem título'}</div>
        <div class="session-speaker">
          <i class="bi bi-${isInterval ? 'cup-hot' : 'person'}"></i>
          ${activity.speaker || 'Palestrante não definido'}
        </div>
        ${activity.local ? `<div class="session-location"><i class="bi bi-geo-alt"></i> ${activity.local}</div>` : ''}
      </div>
      <div class="session-actions">
        <button type="button" 
                class="btn btn-outline-primary btn-sm activity-edit-btn" 
                data-index="${index}"
                title="Editar sessão">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" 
                class="btn btn-outline-secondary btn-sm activity-duplicate-btn" 
                data-index="${index}"
                title="Duplicar sessão">
          <i class="bi bi-copy"></i>
        </button>
        <button type="button" 
                class="btn btn-outline-danger btn-sm activity-remove-btn" 
                data-index="${index}"
                title="Remover sessão">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `
  }

  // ===== ATUALIZAÇÃO DE COMPONENTES =====
  
  updateSpeakersList() {
    if (!this.controller.speakersListTarget) return
    
    const activities = this.getActivities()
    const container = this.controller.speakersListTarget
    
    const speakers = this.extractSpeakers(activities)
    
    if (speakers.length === 0) {
      container.innerHTML = '<p class="text-muted small">Nenhum palestrante definido</p>'
    } else {
      container.innerHTML = speakers.map(speaker => this.createSpeakerItemHTML(speaker, activities)).join('')
    }
  }

  createSpeakerItemHTML(speaker, activities) {
    const sessionsCount = activities.filter(a => a.speaker === speaker).length
    
    return `
      <div class="speaker-item">
        <div class="speaker-avatar">
          ${speaker.charAt(0).toUpperCase()}
        </div>
        <div class="speaker-info">
          <div class="speaker-name">${speaker}</div>
          <div class="speaker-sessions">
            ${sessionsCount} sessão${sessionsCount !== 1 ? 'ões' : ''}
          </div>
        </div>
      </div>
    `
  }

  updatePreview() {
    if (!this.controller.previewTimeTarget) return
    
    const eventData = this.controller.eventManager.getEventData()
    const activities = this.getActivities()
    
    // Atualiza informações do evento no preview
    if (this.controller.previewLocationTarget) {
      this.controller.previewLocationTarget.textContent = eventData.local || 'Local não definido'
    }
    
    if (this.controller.previewDateTarget) {
      this.controller.previewDateTarget.textContent = this.utils.formatDate(eventData.period_start) || 'Data não definida'
    }

    // Calcula horário das sessões
    if (activities.length > 0) {
      const timeRange = this.calculateActivitiesTimeRange(activities)
      if (timeRange && this.controller.previewTimeTarget) {
        this.controller.previewTimeTarget.textContent = `${timeRange.start} – ${timeRange.end}`
      }
    }
  }

  // ===== DADOS E STORAGE =====
  
  getActivities() {
    try {
      const activitiesString = sessionStorage.getItem(this.storageKey)
      
      if (!activitiesString) {
        this.utils.log('Nenhuma atividade encontrada, retornando array vazio')
        return []
      }
      
      const activities = JSON.parse(activitiesString)
      
      if (!Array.isArray(activities)) {
        this.utils.logError('Dados não são um array, retornando array vazio')
        return []
      }
      
      return activities
    } catch (error) {
      this.utils.logError('Erro ao parsear atividades:', error)
      sessionStorage.removeItem(this.storageKey)
      return []
    }
  }

  saveActivities(activities) {
    try {
      if (!Array.isArray(activities)) {
        this.utils.logError('Tentando salvar dados que não são array:', activities)
        return false
      }
      
      const activitiesString = JSON.stringify(activities)
      sessionStorage.setItem(this.storageKey, activitiesString)
      this.utils.log('Atividades salvas:', activities.length, 'itens')
      return true
    } catch (error) {
      this.utils.logError('Erro ao salvar atividades:', error)
      return false
    }
  }

  clearActivities() {
    try {
      sessionStorage.removeItem(this.storageKey)
      this.renderActivitiesList()
      this.triggerActivitiesChangedEvent()
      return true
    } catch (error) {
      this.utils.logError('Erro ao limpar atividades:', error)
      return false
    }
  }

  // ===== MÉTODOS AUXILIARES =====
  
  getModalFields() {
    const targets = this.controller.getTargetsMap()
    
    return {
      
      name: targets.activityName,
      title: targets.activityTitle,
      local: targets.activityLocal,
      speaker: targets.activitySpeaker,
      period_start: targets.activityPeriodStart,
      period_end: targets.activityPeriodEnd,
      certificate_hours: targets.activityCertificateHours,
      subscriptions_open: targets.activitySubscriptionsOpen
    }
  }

  getActivityDataFromModal() {
    const fields = this.getModalFields()
    
    return {
      name: fields.name?.value.trim() || '',
      title: fields.title?.value.trim() || '',
      local: fields.local?.value.trim() || '',
      speaker: fields.speaker?.value.trim() || '',
      period_start: fields.period_start?.value || '',
      period_end: fields.period_end?.value || '',
      certificate_hours: fields.certificate_hours?.value || '',
      subscriptions_open: fields.subscriptions_open?.value || ''
    }
  }

  populateModalWithActivity(activity) {
    const fields = this.getModalFields()
    
    Object.entries(fields).forEach(([key, field]) => {
      if (field && activity[key] !== undefined) {
        field.value = activity[key] || ''
      }
    })
  }

  validateActivity(activity) {
    const errors = []
    
    // Validações obrigatórias
    if (!this.utils.validateRequired(activity.name)) {
      errors.push('Nome da atividade é obrigatório')
    }
    
    if (!this.utils.validateRequired(activity.title)) {
      errors.push('Título da atividade é obrigatório')
    }
    
    // Validações de horário
    if (activity.period_start && activity.period_end) {
      const start = new Date(activity.period_start)
      const end = new Date(activity.period_end)
      
      if (start >= end) {
        errors.push('Horário de início deve ser anterior ao horário de fim')
      }
    }
    
    // Validação de horas de certificado
    if (activity.certificate_hours) {
      const hours = parseFloat(activity.certificate_hours)
      if (isNaN(hours) || hours <= 0) {
        errors.push('Horas de certificado deve ser um número positivo')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  sortActivitiesByTime(activities) {
    return [...activities].sort((a, b) => {
      if (a.period_start && b.period_start) {
        return new Date(a.period_start) - new Date(b.period_start)
      }
      return 0
    })
  }

  isIntervalActivity(activity) {
    return activity.speaker && 
           (activity.speaker.toLowerCase().includes('intervalo') ||
            activity.speaker.toLowerCase().includes('coffee') ||
            activity.speaker.toLowerCase().includes('pausa'))
  }

  extractSpeakers(activities) {
    return this.utils.removeDuplicates(
      activities
        .map(a => a.speaker)
        .filter(s => s && !this.isIntervalActivity({ speaker: s }))
    )
  }

  calculateActivitiesTimeRange(activities) {
    const times = activities
      .filter(a => a.period_start)
      .map(a => new Date(a.period_start))
      .sort()
    
    if (times.length === 0) return null
    
    const startTime = this.utils.formatTime(times[0])
    const endTimes = activities
      .filter(a => a.period_end)
      .map(a => new Date(a.period_end))
      .sort()
    
    const endTime = endTimes.length > 0 
      ? this.utils.formatTime(endTimes[endTimes.length - 1])
      : '17:00'
    
    return { start: startTime, end: endTime }
  }

  // ===== EVENTOS =====
  
  triggerActivitiesChangedEvent() {
    const event = new CustomEvent('activitiesChanged', {
      detail: { activities: this.getActivities() }
    })
    document.dispatchEvent(event)
  }

  onActivitiesChanged(callback) {
    document.addEventListener('activitiesChanged', callback)
  }

  // ===== UTILITÁRIOS ESPECÍFICOS =====
  
  getActivitiesSummary() {
    const activities = this.getActivities()
    const speakers = this.extractSpeakers(activities)
    
    return {
      total: activities.length,
      speakers: speakers.length,
      timeRange: this.calculateActivitiesTimeRange(activities),
      hasActivities: activities.length > 0
    }
  }

  exportActivities() {
    const activities = this.getActivities()
    const exportData = {
      activities: activities,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `atividades_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    this.utils.log('Atividades exportadas')
  }

  // ===== MÉTODOS DE DEBUG =====
  
  debugActivities() {
    const activities = this.getActivities()
    const summary = this.getActivitiesSummary()
    
    console.log("=== DEBUG ACTIVITIES ===")
    console.log("Activities:", activities)
    console.log("Summary:", summary)
    console.log("Storage size:", JSON.stringify(activities).length, "chars")
    console.log("=== END DEBUG ===")
  }
}
