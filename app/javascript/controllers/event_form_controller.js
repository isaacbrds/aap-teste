// controllers/event_form_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    // Tabs
    "tabButton",
    "tabContent",
    
    // Formulário e dados
    "eventForm",
    "activitiesContainer",
    "activitiesModal",
    
    // Campos do modal de atividades
    "activityName",
    "activityTitle",
    "activityLocal",
    "activitySpeaker",
    "activityPeriodStart",
    "activityPeriodEnd",
    "activityCertificateHours",
    "activitySubscriptionsOpen",
    
    // Configurações da agenda
    "agendaDate",
    "timezone",
    "speakersList",
    
    // Preview
    "previewLocation",
    "previewTime",
    "previewDate",
    
    // Resumo do evento
    "summaryEventName",
    "summaryEventDate", 
    "summaryEventLocation",
    "summaryEventResponsible",
    "summaryEventEmail",
    "summaryEventBanner",
    "summarySessionsCount",
    "summaryAgenda",
    "summarySpeakersCount",
    "summarySpeakers",
    "statusBasic",
    "statusAgenda", 
    "statusTickets",
    "completionProgress",
    "completionPercentage",
    "eventStatus"
  ]

  connect() {
    console.log("Event Form Controller conectado")
    this.editingIndex = null
    this.currentTab = "basico"
    this.loadEventDataIfExists()
    this.renderActivitiesList()
  }

  // ===== GERENCIAMENTO DE TABS =====
  
  switchTab(event) {
    const targetTab = event.currentTarget.dataset.tab
    this.showTab(targetTab)
  }

  showTab(tabName) {
    console.log(`Mudando para tab: ${tabName}`)
    
    // Atualiza botões das tabs
    this.tabButtonTargets.forEach(button => {
      const isActive = button.dataset.tab === tabName
      button.classList.toggle("active", isActive)
    })
    
    // Atualiza conteúdo das tabs
    this.tabContentTargets.forEach(content => {
      const isActive = content.dataset.tab === tabName
      content.classList.toggle("show", isActive)
      content.classList.toggle("active", isActive)
    })
    
    this.currentTab = tabName
    
    // Ações específicas por tab
    if (tabName === "agenda") {
      this.renderActivitiesList()
    }

    if (tabName === 'publicar') {
      this.updateEventSummary()
    }
  }

  saveAndNextTab() {
    if (this.currentTab === "basico") {
      this.saveEventData()
      this.showTab("agenda")
    } else if (this.currentTab === "agenda") {
      this.showTab("ingressos")
    } else if (this.currentTab === "ingressos") {
      this.showTab("publicar")
    }
  }

  previousTab() {
    if (this.currentTab === "agenda") {
      this.showTab("basico")
    } else if (this.currentTab === "ingressos") {
      this.showTab("agenda")
    } else if (this.currentTab === "publicar") {
      this.showTab("ingressos")
    }
  }

  // ===== GERENCIAMENTO DE DADOS DO EVENTO =====
  
  saveEventData() {
    const form = document.querySelector('form')
    if (!form) return
    
    const formData = new FormData(form)
    const eventData = {}
    
    // Processa campos normais (exceto arquivos)
    formData.forEach((value, key) => {
      if (key !== 'event[banner]') {
        const cleanKey = key.replace(/^event\[/, '').replace(/\]$/, '')
        eventData[cleanKey] = value
      }
    })
    
    // Processa arquivo de banner
    const bannerInput = form.querySelector('input[name="event[banner]"]')
    if (bannerInput && bannerInput.files.length > 0) {
      const file = bannerInput.files[0]
      const imageUrl = URL.createObjectURL(file)
      
      eventData.bannerUrl = imageUrl
      eventData.bannerName = file.name
      eventData.bannerSize = file.size
    }

    sessionStorage.setItem('eventData', JSON.stringify(eventData))
    console.log('Dados do evento salvos:', eventData)
  }

  loadEventDataIfExists() {
    const eventData = sessionStorage.getItem('eventData')
    if (!eventData) return
    
    const data = JSON.parse(eventData)
    const form = document.querySelector('form')
    if (!form) return
    
    // Preenche os campos do formulário
    for (const [key, value] of Object.entries(data)) {
      if (key.endsWith('Url') || key.endsWith('Name') || key.endsWith('Size')) continue
      
      const input = form.querySelector(`[name="event[${key}]"]`)
      if (input) {
        input.value = value
      }
    }
    
    
    console.log('Dados do evento carregados')
  }

  // ===== GERENCIAMENTO DE ATIVIDADES =====
  
  openModal() {
    this.activitiesModalTarget.classList.remove("hidden")
    const modalTitle = this.activitiesModalTarget.querySelector('h2')
    if (this.editingIndex !== null && this.editingIndex !== undefined) {
      modalTitle.textContent = 'Editar Sessão'
    } else {
      modalTitle.textContent = 'Adicionar Nova Sessão'
      this.clearModalFields()
    }
    
  }

  closeModal() {
    this.activitiesModalTarget.classList.add("hidden")
    this.clearModalFields()
    this.editingIndex = null
  }

  clearModalFields() {
    this.activityNameTarget.value = ''
    this.activityTitleTarget.value = ''
    this.activityLocalTarget.value = ''
    this.activitySpeakerTarget.value = ''
    this.activityPeriodStartTarget.value = ''
    this.activityPeriodEndTarget.value = ''
    this.activityCertificateHoursTarget.value = ''
    this.activitySubscriptionsOpenTarget.value = ''
  }

  addActivity(event) {
    event.preventDefault()
    
    const name = this.activityNameTarget.value.trim()
    const title = this.activityTitleTarget.value.trim()
    const local = this.activityLocalTarget.value.trim()
    const speaker = this.activitySpeakerTarget.value.trim()
    const period_start = this.activityPeriodStartTarget.value
    const period_end = this.activityPeriodEndTarget.value
    const certificate_hours = this.activityCertificateHoursTarget.value
    const subscriptions_open = this.activitySubscriptionsOpenTarget.value

    if (!name || !title) {
      alert('Preencha pelo menos Nome e Título da atividade!')
      return
    }

    let activities = this.getActivities()
    const activityData ={
      name: name,
      title: title,
      local: local,
      speaker: speaker,
      period_start: period_start,
      period_end: period_end,
      certificate_hours: certificate_hours,
      subscriptions_open: subscriptions_open
    }

    // Se está editando, substitui a atividade existente
    if (this.editingIndex !== undefined && this.editingIndex !== null) {
      console.log('Editando atividade no índice:', this.editingIndex)
      activities[this.editingIndex] = activityData
      this.editingIndex = null // Limpa o índice de edição
    } else {
      // Senão, adiciona nova atividade
      console.log('Adicionando nova atividade')
      activities.push(activityData)
    }
    
    if (this.saveActivities(activities)) {
      this.closeModal()
      this.renderActivitiesList()
      console.log('Atividade salva com sucesso')
    } else {
      alert('Erro ao salvar atividade!')
    }
  }
  // Renderiza as sessões da agenda
  renderActivitiesList() {
    let activities = this.getActivities()
    const container = this.activitiesContainerTarget
    console.log('Renderizando', activities.length, 'atividades')
    
    container.innerHTML = ""
    
    if (activities.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-calendar-x text-muted" style="font-size: 2rem;"></i>
          <p class="text-muted mt-2">Nenhuma sessão adicionada ainda.</p>
          <button type="button" class="btn btn-outline-primary" data-action="event-form#openModal">
            <i class="bi bi-plus-circle"></i> Adicionar primeira sessão
          </button>
        </div>
      `
    } else {
      // Ordena por horário
      activities.sort((a, b) => {
        if (a.period_start && b.period_start) {
          return new Date(a.period_start) - new Date(b.period_start)
        }
        return 0
      })
      
      activities.forEach((activity, index) => {
        const sessionItem = this.createSessionItem(activity, index)
        container.appendChild(sessionItem)
      })
    }
    
    this.updateSpeakersList()
    this.updatePreview()
  }

  // Cria um item de sessão
  createSessionItem(activity, index) {
    const div = document.createElement('div')
    const isInterval = activity.speaker && activity.speaker.toLowerCase().includes('intervalo')
    
    div.className = `session-item ${isInterval ? 'interval' : ''}`
    div.innerHTML = `
      <div class="session-time">
        ${this.formatTime(activity.period_start)}
      </div>
      <div class="session-content">
        <div class="session-title">${activity.name || activity.title || 'Sessão sem título'}</div>
        <div class="session-speaker">
          <i class="bi bi-${isInterval ? 'cup-hot' : 'person'}"></i>
          ${activity.speaker || 'Palestrante não definido'}
        </div>
      </div>
      <div class="session-actions">
        <button type="button" 
                class="btn btn-outline-primary btn-sm" 
                data-action="event-form#editActivity"
                data-activity-index="${index}">
          <i class="bi bi-pencil"></i>
        </button>
        <button type="button" 
                class="btn btn-outline-danger btn-sm" 
                data-action="event-form#removeActivity"
                data-activity-index="${index}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `
    
    return div
  }

  // Atualiza lista de palestrantes
  updateSpeakersList() {
    let activities = this.getActivities()
    const container = this.speakersListTarget
    
    // Extrai palestrantes únicos
    const speakers = [...new Set(activities
      .map(a => a.speaker)
      .filter(s => s && !s.toLowerCase().includes('intervalo'))
    )]
    
    if (speakers.length === 0) {
      container.innerHTML = '<p class="text-muted small">Nenhum palestrante definido</p>'
    } else {
      container.innerHTML = speakers.map(speaker => `
        <div class="speaker-item">
          <div class="speaker-avatar">
            ${speaker.charAt(0).toUpperCase()}
          </div>
          <div class="speaker-info">
            <div class="speaker-name">${speaker}</div>
            <div class="speaker-sessions">
              ${activities.filter(a => a.speaker === speaker).length} sessão(ões)
            </div>
          </div>
        </div>
      `).join('')
    }
  }

  // Atualiza preview
  updatePreview() {
    const eventData = JSON.parse(sessionStorage.getItem('eventData')) || {}
    const activities = JSON.parse(sessionStorage.getItem('activities')) || []
    this.previewDateTarget.textContent = this.formatDate(eventData.period_start) || 'Data não definida'
    // Atualiza informações do evento
    this.previewLocationTarget.textContent = eventData.local || 'Local não definido'
    
    // Calcula horário das sessões
    if (activities.length > 0) {
      const times = activities
        .filter(a => a.period_start)
        .map(a => new Date(a.period_start))
        .sort()
      
        if (times.length > 0) {
          const startTime = this.formatTime(times[0])
          const endTime = activities
            .filter(a => a.period_end)
            .map(a => new Date(a.period_end))
            .sort()
            .pop()
          
          this.previewTimeTarget.textContent = `${startTime} – ${endTime ? this.formatTime(endTime) : '17:00'}`
        }
      }
    }
  
  updateEventSummary() {
    console.log('Atualizando resumo do evento...')
    
    this.updateBasicInfo()
    this.updateAgendaSummary() 
    this.updateSpeakersSummary()
    this.updateCompletionStatus()
  }

  // Atualiza informações básicas do evento
  updateBasicInfo() {
    const eventData = this.getEventData()

    // Nome do evento
    this.summaryEventNameTarget.textContent = eventData.name || 'Nome do evento não definido'
    
    // Data do evento
    const startDate = eventData.period_start
    const endDate = eventData.period_end
    let dateText = 'Data não definida'
    
    if (startDate) {
      const start = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        if (start.toDateString() === end.toDateString()) {
          // Mesmo dia
          dateText = `${start.toLocaleDateString('pt-BR')} das ${start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} às ${end.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`
        } else {
          // Dias diferentes
          dateText = `${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`
        }
      } else {
        dateText = start.toLocaleDateString('pt-BR')
      }
    }
    this.summaryEventDateTarget.textContent = dateText
    
    // Outras informações
    this.summaryEventLocationTarget.textContent = eventData.local || 'Local não definido'
    this.summaryEventResponsibleTarget.textContent = eventData.responsable || 'Responsável não definido'
    this.summaryEventEmailTarget.textContent = eventData.email || 'Email não definido'
    
    // Banner
    if (eventData.bannerUrl) {
      this.summaryEventBannerTarget.innerHTML = `
        <img src="${eventData.bannerUrl}" 
            alt="Banner do evento" 
            style="width: 100%; height: 100%; object-fit: cover;">
      `
    } else {
      this.summaryEventBannerTarget.innerHTML = `
        <div class="banner-placeholder">
          <i class="bi bi-image"></i>
          <span>Banner não definido</span>
        </div>
      `
    }
  }

  // Atualiza resumo da agenda
updateAgendaSummary() {
  const activities = this.getActivities()
  
  // Atualiza contador de sessões
  this.summarySessionsCountTarget.textContent = `${activities.length} sess${activities.length !== 1 ? 'ões' : 'ão'}`
  
  const container = this.summaryAgendaTarget
  
  if (activities.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3 text-muted">
        <i class="bi bi-calendar-x"></i>
        <p class="mb-0 mt-2">Nenhuma sessão configurada</p>
      </div>
    `
  } else {
    // Ordena por horário
    const sortedActivities = activities.sort((a, b) => {
      if (a.period_start && b.period_start) {
        return new Date(a.period_start) - new Date(b.period_start)
      }
      return 0
    })
    
    // Mostra apenas as primeiras 5 sessões
    const displayActivities = sortedActivities.slice(0, 5)
    
    container.innerHTML = displayActivities.map(activity => `
      <div class="session-summary">
        <div class="session-time-summary">
          ${this.formatTime(activity.period_start)}
        </div>
        <div class="session-info-summary">
          <div class="session-title-summary">${activity.name || activity.title || 'Sessão sem título'}</div>
          <div class="session-speaker-summary">
            <i class="bi bi-person me-1"></i>
            ${activity.speaker || 'Palestrante não definido'}
          </div>
        </div>
      </div>
    `).join('')
    
    // Se tem mais de 5, mostra indicador
    if (activities.length > 5) {
      container.innerHTML += `
        <div class="text-center mt-2">
          <small class="text-muted">+ ${activities.length - 5} sessão${activities.length - 5 !== 1 ? 'ões' : ''} adicional${activities.length - 5 !== 1 ? 'is' : ''}</small>
        </div>
      `
    }
  }
}

  // Atualiza resumo dos palestrantes
  updateSpeakersSummary() {
    const activities = this.getActivities()
    
    // Extrai palestrantes únicos (exceto intervalos)
    const speakers = [...new Set(activities
      .map(a => a.speaker)
      .filter(s => s && !s.toLowerCase().includes('intervalo') && !s.toLowerCase().includes('coffee'))
    )]
    
    // Atualiza contador
    this.summarySpeakersCountTarget.textContent = `${speakers.length} palestrante${speakers.length !== 1 ? 's' : ''}`
    
    const container = this.summarySpeakersTarget
    
    if (speakers.length === 0) {
      container.innerHTML = `
        <div class="text-center py-3 text-muted">
          <i class="bi bi-person-x"></i>
          <p class="mb-0 mt-2">Nenhum palestrante definido</p>
        </div>
      `
    } else {
      // Mostra apenas os primeiros 6 palestrantes
      const displaySpeakers = speakers.slice(0, 6)
      
      container.innerHTML = displaySpeakers.map(speaker => `
        <div class="speaker-summary">
          <div class="speaker-avatar-summary">
            ${speaker.charAt(0).toUpperCase()}
          </div>
          <div class="speaker-name-summary">${speaker}</div>
        </div>
      `).join('')
      
      // Se tem mais de 6, mostra indicador
      if (speakers.length > 6) {
        container.innerHTML += `
          <div class="text-center mt-2">
            <small class="text-muted">+ ${speakers.length - 6} palestrante${speakers.length - 6 !== 1 ? 's' : ''} adicional${speakers.length - 6 !== 1 ? 'is' : ''}</small>
          </div>
        `
      }
    }
  }

  // Atualiza status de completude do evento
  updateCompletionStatus() {
    const eventData = this.getEventData()
    const activities = this.getActivities()
    
    let completedItems = 0
    const totalItems = 3
    
    // Verifica informações básicas
    const hasBasicInfo = eventData.name && eventData.email && eventData.responsable && eventData.local
    if (hasBasicInfo) {
      this.statusBasicTarget.classList.add('completed')
      this.statusBasicTarget.querySelector('i').classList.remove('bi-circle')
      this.statusBasicTarget.querySelector('i').classList.add('bi-check-circle-fill', 'text-success')
      completedItems++
    } else {
      this.statusBasicTarget.classList.remove('completed')
      this.statusBasicTarget.querySelector('i').classList.remove('bi-check-circle-fill', 'text-success')
      this.statusBasicTarget.querySelector('i').classList.add('bi-circle', 'text-muted')
    }
    
    // Verifica agenda
    const hasAgenda = activities.length > 0
    if (hasAgenda) {
      this.statusAgendaTarget.classList.add('completed')
      this.statusAgendaTarget.querySelector('i').classList.remove('bi-circle')
      this.statusAgendaTarget.querySelector('i').classList.add('bi-check-circle-fill', 'text-success')
      completedItems++
    } else {
      this.statusAgendaTarget.classList.remove('completed')
      this.statusAgendaTarget.querySelector('i').classList.remove('bi-check-circle-fill', 'text-success')
      this.statusAgendaTarget.querySelector('i').classList.add('bi-circle', 'text-muted')
    }
    
    // Ingressos (sempre incompleto por enquanto)
    this.statusTicketsTarget.classList.add('completed')
    this.statusTicketsTarget.querySelector('i').classList.remove('bi-check-circle-fill', 'text-success')
    this.statusTicketsTarget.querySelector('i').classList.add('bi-circle', 'text-muted')
    completedItems++
    // Atualiza barra de progresso
    const percentage = Math.round((completedItems / totalItems) * 100)
    this.completionProgressTarget.style.width = `${percentage}%`
    this.completionPercentageTarget.textContent = `${percentage}%`
    
    // Muda cor da barra baseado no progresso
    this.completionProgressTarget.className = 'progress-bar'
    if (percentage >= 100) {
      this.completionProgressTarget.classList.add('bg-success')
    } else if (percentage >= 50) {
      this.completionProgressTarget.classList.add('bg-warning')
    } else {
      this.completionProgressTarget.classList.add('bg-danger')
    }
  }

  // Visualizar evento
  previewEvent() {
    alert('Funcionalidade de preview em desenvolvimento!')
    // Aqui você pode abrir uma nova aba com o preview do evento
  }

  // Exportar evento
  exportEvent() {
    const eventData = this.getEventData()
    const activities = this.getActivities()
    
    const exportData = {
      event: eventData,
      activities: activities,
      exportedAt: new Date().toISOString()
    }
    
    // Cria arquivo JSON para download
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], {type: 'application/json'})
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `evento_${eventData.name || 'sem_nome'}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // Salvar como rascunho
  saveDraft() {
    // Aqui você salvaria no backend como rascunho
    alert('Rascunho salvo com sucesso!')
    console.log('Salvando como rascunho...')
  }

  // Publicar evento
  publishEvent() {
    const eventData = this.getEventData()
    const activities = this.getActivities()
    
    // Validações básicas
    if (!eventData.name || !eventData.email || !eventData.responsable) {
      alert('Preencha todas as informações básicas antes de publicar!')
      return
    }
    
    if (activities.length === 0) {
      if (!confirm('Nenhuma sessão foi configurada. Deseja publicar mesmo assim?')) {
        return
      }
    }
    
    // Aqui você enviaria os dados para o backend
    console.log('Publicando evento:', { eventData, activities })
    alert('Evento publicado com sucesso!')
  }




  // Método auxiliar para obter dados do evento
  getEventData() {
    try {
      const eventDataString = sessionStorage.getItem('eventData')
      if (!eventDataString) return {}
      
      const eventData = JSON.parse(eventDataString)
      return eventData || {}
    } catch (error) {
      console.error('Erro ao obter dados do evento:', error)
      return {}
    }
  }


  // Formata horário
  formatDate(dateString) {
    if (!dateString) return '--/--/----'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
  formatTime(dateString) {
    if (!dateString) return '--:--'
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }


  removeActivity(event) {
    const index = parseInt(event.currentTarget.dataset.activityIndex)
  
    console.log('Removendo atividade no índice:', index)
  
    if (confirm('Tem certeza que deseja remover esta sessão?')) {
      const activities = this.getActivities()
      
      if (activities[index]) {
        console.log('Removendo atividade:', activities[index])
        activities.splice(index, 1)
        
        if (this.saveActivities(activities)) {
          this.renderActivitiesList()
          console.log('Atividade removida com sucesso')
        } else {
          alert('Erro ao remover atividade!')
        }
      } else {
        console.error('Atividade não encontrada no índice:', index)
        alert('Erro: Atividade não encontrada!')
      }
    }
  }

  editActivity(event) {

    const index = parseInt(event.currentTarget.dataset.activityIndex)

    console.log('Editar atividade:', index)
    let activities = this.getActivities()
    console.log('Total de atividades:', activities)


    if (activities[index]) {
      const activity = activities[index]
      console.log('Dados da atividade:', activity)
      // Preenche o modal com os dados da atividade
      this.activityNameTarget.value = activity.name || ''
      this.activityTitleTarget.value = activity.title || ''
      this.activityLocalTarget.value = activity.local || ''
      this.activitySpeakerTarget.value = activity.speaker || ''
      this.activityPeriodStartTarget.value = activity.period_start || ''
      this.activityPeriodEndTarget.value = activity.period_end || ''
      this.activityCertificateHoursTarget.value = activity.certificate_hours || ''
      this.activitySubscriptionsOpenTarget.value = activity.subscriptions_open || ''
      
      // Marca que está editando
      this.editingIndex = index
      console.log('Modo de edição ativado para índice:', this.editingIndex)
      this.openModal()
    }else {
      console.error('Atividade não encontrada para o índice:', index)
      alert('Erro: Atividade não encontrada.')
    }
  }

  // ===== FUNCIONALIDADES EXTRAS =====
  
  previewAgenda() {
    alert('Preview da agenda em desenvolvimento!')
  }

  validateEventForm() {
    const form = document.querySelector('form')
    if (!form) return false
    
    const nameInput = form.querySelector('input[name*="[name]"]')
    if (!nameInput || !nameInput.value.trim()) {
      alert('Por favor, preencha o nome do evento')
      return false
    }
    return true
  }

  // Método auxiliar para formatar tamanho de arquivo
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Método auxiliar para obter atividades de forma segura
  getActivities() {
    try {
      const activitiesString = sessionStorage.getItem('activities')
      console.log('String do sessionStorage:', activitiesString)
      
      if (!activitiesString) {
        console.log('Nenhuma atividade encontrada, retornando array vazio')
        return []
      }
      
      const activities = JSON.parse(activitiesString)
      console.log('Atividades parseadas:', activities)
      
      // Garante que é um array
      if (!Array.isArray(activities)) {
        console.error('Dados não são um array, retornando array vazio')
        return []
      }
      
      return activities
    } catch (error) {
      console.error('Erro ao parsear atividades:', error)
      console.log('Limpando sessionStorage e retornando array vazio')
      sessionStorage.removeItem('activities')
      return []
    }
  }

  // Método auxiliar para salvar atividades de forma segura
  saveActivities(activities) {
    try {
      if (!Array.isArray(activities)) {
        console.error('Tentando salvar dados que não são array:', activities)
        return false
      }
      
      const activitiesString = JSON.stringify(activities)
      console.log('Salvando atividades:', activitiesString)
      sessionStorage.setItem('activities', activitiesString)
      return true
    } catch (error) {
      console.error('Erro ao salvar atividades:', error)
      return false
    }
  }

  // Método para debugar o estado do sessionStorage
  debugSessionStorage() {
    console.log('=== DEBUG SESSION STORAGE ===')
    console.log('activities (string):', sessionStorage.getItem('activities'))
    console.log('eventData (string):', sessionStorage.getItem('eventData'))
    
    try {
      const activities = JSON.parse(sessionStorage.getItem('activities') || '[]')
      console.log('activities (parsed):', activities)
      console.log('É array?', Array.isArray(activities))
      console.log('Quantidade:', activities.length)
    } catch (e) {
      console.error('Erro ao parsear activities:', e)
    }
    
    console.log('=== FIM DEBUG ===')
  }

}

