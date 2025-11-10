// managers/summary_generator.js
export class SummaryGenerator {
  constructor(controller) {
    this.controller = controller
    this.utils = controller.utils
    console.log("SummaryGenerator inicializado")
  }

  // ===== ATUALIZAÇÃO PRINCIPAL DO RESUMO =====
  
  updateEventSummary() {
    this.utils.log('Atualizando resumo do evento...')
    
    this.updateBasicInfo()
    this.updateAgendaSummary()
    this.updateSpeakersSummary()
    this.updateCompletionStatus()
    
    this.triggerSummaryUpdatedEvent()
  }

  // ===== INFORMAÇÕES BÁSICAS =====
  
  updateBasicInfo() {
    const eventData = this.controller.eventManager.getEventData()
    console.log("eventData:", eventData)
    
    // Nome do evento
    this.updateTarget('summaryEventName', eventData.name || 'Nome do evento não definido')
    
    // Data do evento
    const dateText = this.formatEventDateRange(eventData)
    this.updateTarget('summaryEventDate', dateText)
    
    // Outras informações
    this.updateTarget('summaryEventLocation', eventData.local || 'Local não definido')
    this.updateTarget('summaryEventResponsible', eventData.responsable || 'Responsável não definido')
    this.updateTarget('summaryEventEmail', eventData.email || 'Email não definido')
    
    // Banner
    this.updateBannerSummary(eventData)
  }

  updateBannerSummary(eventData) {
    const bannerTarget = this.getTarget('summaryEventBanner')
    if (!bannerTarget) return

    if (eventData.bannerUrl || eventData.hasBanner) {
      bannerTarget.innerHTML = `
        <img src="${eventData.bannerUrl}" 
             alt="Banner do evento" 
             style="width: 100%; height: 100%; object-fit: cover;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div class="banner-placeholder" style="display: none;">
          <i class="bi bi-image"></i>
          <span>Erro ao carregar banner</span>
        </div>
      `
    } else {
      bannerTarget.innerHTML = `
        <div class="banner-placeholder">
          <i class="bi bi-image"></i>
          <span>Banner não definido</span>
        </div>
      `
    }
  }

  formatEventDateRange(eventData) {
    if (!eventData.period_start) return 'Data não definida'
    
    const start = new Date(eventData.period_start)
    const end = eventData.period_end ? new Date(eventData.period_end) : null
    
    if (end && start.toDateString() === end.toDateString()) {
      // Mesmo dia - mostra horário
      return `${this.utils.formatDate(start)} das ${this.utils.formatTime(start)} às ${this.utils.formatTime(end)}`
    } else if (end) {
      // Dias diferentes
      return `${this.utils.formatDate(start)} a ${this.utils.formatDate(end)}`
    } else {
      // Só data de início
      return this.utils.formatDate(start)
    }
  }

  // ===== RESUMO DA AGENDA =====
  
  updateAgendaSummary() {
    const activities = this.controller.activitiesManager.getActivities()
    
    // Atualiza contador de sessões
    const sessionsText = `${activities.length} sessão${activities.length !== 1 ? 'ões' : ''}`
    this.updateTarget('summarySessionsCount', sessionsText)
    
    const container = this.getTarget('summaryAgenda')
    if (!container) return

    if (activities.length === 0) {
      this.renderEmptyAgenda(container)
    } else {
      this.renderAgendaSummary(container, activities)
    }
  }

  renderEmptyAgenda(container) {
    container.innerHTML = `
      <div class="text-center py-3 text-muted">
        <i class="bi bi-calendar-x"></i>
        <p class="mb-0 mt-2">Nenhuma sessão configurada</p>
      </div>
    `
  }

  renderAgendaSummary(container, activities) {
    // Ordena por horário
    const sortedActivities = this.utils.sortByProperty(activities, 'period_start', true)
    
    // Mostra apenas as primeiras 5 sessões
    const displayActivities = sortedActivities.slice(0, 5)
    
    container.innerHTML = displayActivities.map(activity => 
      this.createSessionSummaryHTML(activity)
    ).join('')
    
    // Se tem mais de 5, mostra indicador
    if (activities.length > 5) {
      const remaining = activities.length - 5
      container.innerHTML += `
        <div class="text-center mt-2">
          <small class="text-muted">
            + ${remaining} sessão${remaining !== 1 ? 'ões' : ''} adicional${remaining !== 1 ? 'is' : ''}
          </small>
        </div>
      `
    }
  }

  createSessionSummaryHTML(activity) {
    return `
      <div class="session-summary">
        <div class="session-time-summary">
          ${this.utils.formatTime(activity.period_start)}
        </div>
        <div class="session-info-summary">
          <div class="session-title-summary">
            ${activity.name || activity.title || 'Sessão sem título'}
          </div>
          <div class="session-speaker-summary">
            <i class="bi bi-person me-1"></i>
            ${activity.speaker || 'Palestrante não definido'}
          </div>
          ${activity.local ? `
            <div class="session-location-summary">
              <i class="bi bi-geo-alt me-1"></i>
              ${activity.local}
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  // ===== RESUMO DOS PALESTRANTES =====
  
  updateSpeakersSummary() {
    const activities = this.controller.activitiesManager.getActivities()
    const speakers = this.extractUniqueSpeakers(activities)
    
    // Atualiza contador
    const speakersText = `${speakers.length} palestrante${speakers.length !== 1 ? 's' : ''}`
    this.updateTarget('summarySpeakersCount', speakersText)
    
    const container = this.getTarget('summarySpeakers')
    if (!container) return

    if (speakers.length === 0) {
      this.renderEmptySpeakers(container)
    } else {
      this.renderSpeakersSummary(container, speakers, activities)
    }
  }

  renderEmptySpeakers(container) {
    container.innerHTML = `
      <div class="text-center py-3 text-muted">
        <i class="bi bi-person-x"></i>
        <p class="mb-0 mt-2">Nenhum palestrante definido</p>
      </div>
    `
  }

  renderSpeakersSummary(container, speakers, activities) {
    // Mostra apenas os primeiros 6 palestrantes
    const displaySpeakers = speakers.slice(0, 6)
    
    container.innerHTML = displaySpeakers.map(speaker => 
      this.createSpeakerSummaryHTML(speaker, activities)
    ).join('')
    
    // Se tem mais de 6, mostra indicador
    if (speakers.length > 6) {
      const remaining = speakers.length - 6
      container.innerHTML += `
        <div class="text-center mt-2">
          <small class="text-muted">
            + ${remaining} palestrante${remaining !== 1 ? 's' : ''} adicional${remaining !== 1 ? 'is' : ''}
          </small>
        </div>
      `
    }
  }

  createSpeakerSummaryHTML(speaker, activities) {
    const sessionsCount = activities.filter(a => a.speaker === speaker).length
    
    return `
      <div class="speaker-summary" title="${speaker} - ${sessionsCount} sessão${sessionsCount !== 1 ? 'ões' : ''}">
        <div class="speaker-avatar-summary">
          ${speaker.charAt(0).toUpperCase()}
        </div>
        <div class="speaker-info-summary">
          <div class="speaker-name-summary">${speaker}</div>
          <div class="speaker-sessions-summary">
            ${sessionsCount} sessão${sessionsCount !== 1 ? 'ões' : ''}
          </div>
        </div>
      </div>
    `
  }

  extractUniqueSpeakers(activities) {
    return this.utils.removeDuplicates(
      activities
        .map(a => a.speaker)
        .filter(s => s && !this.isIntervalSpeaker(s))
    )
  }

  isIntervalSpeaker(speaker) {
    const intervalKeywords = ['intervalo', 'coffee', 'pausa', 'break', 'almoço', 'lanche']
    return intervalKeywords.some(keyword => 
      speaker.toLowerCase().includes(keyword)
    )
  }

  // ===== STATUS DE COMPLETUDE =====
  
  updateCompletionStatus() {
    const eventData = this.controller.eventManager.getEventData()
    const activities = this.controller.activitiesManager.getActivities()
    
    const statusItems = this.calculateCompletionStatus(eventData, activities)
    
    // Atualiza cada status individual
    statusItems.forEach(item => {
      this.updateStatusIcon(item.target, item.completed)
    })
    
    // Atualiza barra de progresso
    this.updateProgressBar(statusItems)
  }

  calculateCompletionStatus(eventData, activities) {
    return [
      {
        target: 'statusBasic',
        completed: this.validateBasicInfo(eventData),
        label: 'Informações Básicas'
      },
      {
        target: 'statusAgenda',
        completed: this.validateAgenda(activities),
        label: 'Agenda'
      },
      {
        target: 'statusTickets',
        completed: this.validateTickets(eventData),
        label: 'Ingressos'
      }
    ]
  }

  validateBasicInfo(eventData) {
    const requiredFields = ['name', 'email', 'responsable', 'local', 'period_start']
    return requiredFields.every(field => this.utils.validateRequired(eventData[field]))
  }

  validateAgenda(activities) {
    return activities && activities.length > 0
  }

  validateTickets(eventData) {
    // Por enquanto sempre completo - TODO: implementar validação real
    return true
  }

  updateStatusIcon(targetName, completed) {
    const target = this.getTarget(targetName)
    if (!target) return

    const icon = target.querySelector('i')
    if (!icon) return

    if (completed) {
      target.classList.add('completed')
      icon.className = 'bi bi-check-circle-fill text-success'
    } else {
      target.classList.remove('completed')
      icon.className = 'bi bi-circle text-muted'
    }
  }

  updateProgressBar(statusItems) {
    const completedItems = statusItems.filter(item => item.completed).length
    const totalItems = statusItems.length
    const percentage = Math.round((completedItems / totalItems) * 100)
    
    // Atualiza largura da barra
    const progressBar = this.getTarget('completionProgress')
    if (progressBar) {
      progressBar.style.width = `${percentage}%`
      
      // Atualiza cor baseada no progresso
      progressBar.className = 'progress-bar'
      if (percentage >= 100) {
        progressBar.classList.add('bg-success')
      } else if (percentage >= 50) {
        progressBar.classList.add('bg-warning')
      } else {
        progressBar.classList.add('bg-danger')
      }
    }
    
    // Atualiza texto da porcentagem
    this.updateTarget('completionPercentage', `${percentage}%`)
  }

  // ===== GERAÇÃO DE RELATÓRIOS =====
  
  generateEventReport() {
    const eventData = this.controller.eventManager.getEventData()
    const activities = this.controller.activitiesManager.getActivities()
    const speakers = this.extractUniqueSpeakers(activities)
    
    return {
      basic: {
        name: eventData.name || 'Não definido',
        date: this.formatEventDateRange(eventData),
        location: eventData.local || 'Não definido',
        responsible: eventData.responsable || 'Não definido',
        email: eventData.email || 'Não definido',
        hasBanner: eventData.hasBanner || false
      },
      agenda: {
        totalSessions: activities.length,
        totalSpeakers: speakers.length,
        timeRange: this.calculateEventTimeRange(activities),
        sessions: activities.map(activity => ({
          name: activity.name || activity.title,
          speaker: activity.speaker,
          time: this.utils.formatTime(activity.period_start),
          duration: this.calculateActivityDuration(activity)
        }))
      },
      completion: {
        status: this.calculateCompletionStatus(eventData, activities),
        percentage: this.getCompletionPercentage(eventData, activities),
        isComplete: this.isEventComplete(eventData, activities)
      },
      generatedAt: new Date().toISOString()
    }
  }

  calculateEventTimeRange(activities) {
    if (activities.length === 0) return null
    
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
      : 'Não definido'
    
    return { start: startTime, end: endTime }
  }

  calculateActivityDuration(activity) {
    if (!activity.period_start || !activity.period_end) return null
    
    const start = new Date(activity.period_start)
    const end = new Date(activity.period_end)
    const diffMs = end - start
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    } else {
      return `${minutes}min`
    }
  }

  getCompletionPercentage(eventData, activities) {
    const statusItems = this.calculateCompletionStatus(eventData, activities)
    const completedItems = statusItems.filter(item => item.completed).length
    return Math.round((completedItems / statusItems.length) * 100)
  }

  isEventComplete(eventData, activities) {
    return this.getCompletionPercentage(eventData, activities) === 100
  }

  // ===== EXPORTAÇÃO DE RESUMO =====
  
  exportEventSummary() {
    const report = this.generateEventReport()
    
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `resumo_evento_${report.basic.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    this.utils.log('Resumo do evento exportado')
  }

  generatePrintableSummary() {
    const report = this.generateEventReport()
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(this.createPrintableHTML(report))
    printWindow.document.close()
    printWindow.print()
  }

  createPrintableHTML(report) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resumo do Evento - ${report.basic.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          .section { margin-bottom: 20px; }
          .info-item { margin-bottom: 5px; }
          .sessions { margin-top: 10px; }
          .session { margin-bottom: 8px; padding: 5px; border-left: 3px solid #007bff; }
        </style>
      </head>
      <body>
        <h1>Resumo do Evento</h1>
        
        <div class="section">
          <h2>Informações Básicas</h2>
          <div class="info-item"><strong>Nome:</strong> ${report.basic.name}</div>
          <div class="info-item"><strong>Data:</strong> ${report.basic.date}</div>
          <div class="info-item"><strong>Local:</strong> ${report.basic.location}</div>
          <div class="info-item"><strong>Responsável:</strong> ${report.basic.responsible}</div>
          <div class="info-item"><strong>Email:</strong> ${report.basic.email}</div>
        </div>
        
        <div class="section">
          <h2>Agenda</h2>
          <div class="info-item"><strong>Total de Sessões:</strong> ${report.agenda.totalSessions}</div>
          <div class="info-item"><strong>Total de Palestrantes:</strong> ${report.agenda.totalSpeakers}</div>
          <div class="info-item"><strong>Horário:</strong> ${report.agenda.timeRange ? `${report.agenda.timeRange.start} - ${report.agenda.timeRange.end}` : 'Não definido'}</div>
          
          <div class="sessions">
            ${report.agenda.sessions.map(session => `
              <div class="session">
                <strong>${session.time}</strong> - ${session.name}<br>
                <em>Palestrante: ${session.speaker || 'Não definido'}</em>
                ${session.duration ? `<br>Duração: ${session.duration}` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="section">
          <h2>Status de Completude</h2>
          <div class="info-item"><strong>Progresso:</strong> ${report.completion.percentage}%</div>
          <div class="info-item"><strong>Status:</strong> ${report.completion.isComplete ? 'Completo' : 'Incompleto'}</div>
        </div>
        
        <div class="section">
          <small>Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}</small>
        </div>
      </body>
      </html>
    `
  }

  // ===== MÉTODOS AUXILIARES =====
  
  updateTarget(targetName, content) {
    const target = this.getTarget(targetName)
    if (target) {
      target.textContent = content
    }
  }

  getTarget(targetName) {
    try {
      return this.controller[`${targetName}Target`]
    } catch (error) {
      this.utils.logError(`Target não encontrado: ${targetName}`, error)
      return null
    }
  }

  // ===== EVENTOS =====
  
  triggerSummaryUpdatedEvent() {
    const report = this.generateEventReport()
    const event = new CustomEvent('summaryUpdated', {
      detail: { report: report }
    })
    document.dispatchEvent(event)
  }

  onSummaryUpdated(callback) {
    document.addEventListener('summaryUpdated', callback)
  }

  // ===== MÉTODOS DE DEBUG =====
  
  debugSummary() {
    const report = this.generateEventReport()
    
    console.log("=== DEBUG SUMMARY ===")
    console.log("Event report:", report)
    console.log("Completion:", report.completion.percentage + "%")
    console.log("Is complete:", report.completion.isComplete)
    console.log("=== END DEBUG ===")
  }
}
