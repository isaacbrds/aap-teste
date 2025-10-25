// import { Controller } from "@hotwired/stimulus"

// export default class extends Controller {
//   static targets = [
//     "eventForm",
//     "eventName",
//     "eventEmail",
//     "eventResponsable",
//     "eventBanner",
//     "eventPeriodStart",
//     "eventPeriodEnd",
//     "eventLocal",
//     "eventComission",
//     "eventTxtEnter",
//     "eventTxtAbout",
//     "eventPrimaryColor",
//     "eventSecondaryColor",
//     "activitiesList",
//     "activitiesModal",
//     "activitiesContainer",
//     "activityName",
//     "activityTitle",
//     "activityLocal",
//     "activitySpeaker",
//     "activityPeriodStart",
//     "activityPeriodEnd",
//     "activityCertificateHours",
//     "activitySubscriptionsOpen",
//     "eventResume",
//     "activitiesResumeContainer",
//     "addActivityButton",
//     "updateActivityButton"
//   ]

//   connect() {
//     this.showEventForm()
//     this.renderActivitiesList()
//     this.activityIndex = 0
//   }

//   // Ao clicar em Próximo: salva dados do evento e mostra as atividades
//   nextToActivities(event) {
//     event.preventDefault()
//     console.log("Indo para atividades")
//     if (this.validateEventForm()) {
//       const form = this.eventFormTarget.querySelector('form')
//       const formData = new FormData(form)
//       const eventData = {}
//       formData.forEach((value, key) => {
//         const cleanKey = key.replace(/^event\[/, '').replace(/\]$/, '')
//         if(cleanKey !== 'banner') {
//           eventData[cleanKey] = value
//         }
//       })

//       const bannerInput = form.querySelector('input[name="event[banner]"]')
//       if (bannerInput && bannerInput.files.length > 0) {
//         const file = bannerInput.files[0]
        
//         // Cria URL temporária para a imagem
//         const imageUrl = URL.createObjectURL(file)
        
//         eventData.bannerUrl = imageUrl
//         eventData.bannerName = file.name
//         eventData.bannerSize = file.size
        
//         console.log('Banner processado:', {
//           name: file.name,
//           size: file.size,
//           url: imageUrl
//         })
//       } else {
//         console.log('Nenhum banner selecionado')
//       }


//       // Salva como string
//       console.log('Dados salvos:', eventData) // Para debug
//       sessionStorage.setItem('eventData', JSON.stringify(eventData))
//       this.hideEventForm()
//       this.showActivitiesList()
//     }
//   }

//   // Volta para o formulário do evento
//   backToEvent(event) {
//     event.preventDefault()
//     this.hideActivitiesList()
//     this.showEventForm()
//   }

//   backToActivities(event) {
//     event.preventDefault()
//     this.eventResumeTarget.classList.add("hidden")
//     this.showActivitiesList()
//   }

//   showEventForm() {
//     this.eventFormTarget.classList.remove("hidden")
//     if(sessionStorage.getItem('eventData')) {
//       const eventData = JSON.parse(sessionStorage.getItem('eventData'))
//       const form = this.eventFormTarget.querySelector('form')
//       for (const [key, value] of Object.entries(eventData)) {
//         // const input = form.querySelector(`[name="${key}"]`)
//         const input = form.querySelector(`[name="event[${key}]"]`)
//         if (input) {
//           input.value = value
//         }
//       }
//     }
//     this.activitiesListTarget.classList.add("hidden")
//   }

//  showEventResume() {
//     this.hideActivitiesList()
//     this.eventResumeTarget.classList.remove("hidden")
    
//     const eventData = JSON.parse(sessionStorage.getItem('eventData'))
//     console.log('Dados do evento:', eventData) // Para debug
    
//     // Use os nomes que vêm do Rails (event[campo])
//     this.eventNameTarget.textContent = eventData.name || 'Não informado'
//     this.eventEmailTarget.textContent = eventData.email || 'Não informado'
//     this.eventResponsableTarget.textContent = eventData.responsable || 'Não informado'
//     this.eventPeriodStartTarget.textContent = eventData.period_start || 'Não informado'
//     this.eventLocalTarget.textContent = eventData.local || 'Não informado'
//     // Banner com preview
//     if (eventData.bannerUrl) {
//       this.eventBannerTarget.innerHTML = `
//         <div class="d-flex align-items-center">
//           <img src="${eventData.bannerUrl}" 
//               alt="Banner do evento" 
//               class="me-3"
//               style="max-width: 200px; max-height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;">
//           <div>
//             <strong>${eventData.bannerName}</strong><br>
//             <small class="text-muted">${this.formatFileSize(eventData.bannerSize)}</small>
//           </div>
//         </div>
//       `
//     } else {
//       this.eventBannerTarget.innerHTML = '<span class="text-muted">Nenhuma imagem selecionada</span>'
//     }
//     this.renderActivitiesResume()
//   }

//   renderActivitiesResume() {
//     let activities = JSON.parse(sessionStorage.getItem('activities')) || []
//     const container = this.activitiesResumeContainerTarget
    
//     container.innerHTML = ""
    
//     if (activities.length === 0) {
//       container.innerHTML = '<p class="text-muted">Nenhuma atividade cadastrada.</p>'
//     } else {
//       let html = '<h4>Atividades do Evento:</h4>'
      
//       activities.forEach((activity, index) => {
//         html += `
//           <div class="card mb-3">
//             <div class="card-body">
//               <h5 class="card-title">${activity.name || 'Sem nome'}</h5>
//               <h6 class="card-subtitle mb-2 text-muted">${activity.title || 'Sem título'}</h6>
//               <div class="row">
//                 <div class="col-md-6">
//                   <p><strong>Local:</strong> ${activity.local || 'Não informado'}</p>
//                   <p><strong>Palestrante:</strong> ${activity.speaker || 'Não informado'}</p>
//                 </div>
//                 <div class="col-md-6">
//                   <p><strong>Início:</strong> ${activity.period_start ? new Date(activity.period_start).toLocaleString('pt-BR') : 'Não informado'}</p>
//                   <p><strong>Fim:</strong> ${activity.period_end ? new Date(activity.period_end).toLocaleString('pt-BR') : 'Não informado'}</p>
//                 </div>
//               </div>
//               <div class="row">
//                 <div class="col-md-6">
//                   <p><strong>Carga Horária:</strong> ${activity.certificate_hours || 'Não informado'} horas</p>
//                 </div>
//                 <div class="col-md-6">
//                   <p><strong>Inscrições:</strong> ${activity.subscriptions_open === 'true' ? 'Abertas' : activity.subscriptions_open === 'false' ? 'Fechadas' : 'Não informado'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         `
//       })
      
//       container.innerHTML = html
//     }
//   }

//   hideEventForm() {
//     this.eventFormTarget.classList.add("hidden")
//   }

//   showActivitiesList() {
//     this.activitiesListTarget.classList.remove("hidden")
//     this.renderActivitiesList()
//   }

//   hideActivitiesList() {
//     this.activitiesListTarget.classList.add("hidden")
//   }

//   // ------ Atividades ------
//   openModal() {
//     this.activitiesModalTarget.classList.remove("hidden")
//     console.log(this.activitiesModalTarget);
//     console.log("Abrindo modal de atividades")
//     // Limpa o modal
//     this.limpaModal()
//   }

//   limpaModal() {
//     this.activityNameTarget.value = ''
//     this.activityTitleTarget.value = ''
//     this.activityLocalTarget.value = ''
//     this.activitySpeakerTarget.value = ''
//     this.activityPeriodStartTarget.value = ''
//     this.activityPeriodEndTarget.value = ''
//     this.activityCertificateHoursTarget.value = ''
//     this.activitySubscriptionsOpenTarget.value = ''
//   }

//   closeModal() {
//     this.activitiesModalTarget.classList.add("hidden")
//   }

//   addActivity(event) {
//     event.preventDefault()
//     const name = this.activityNameTarget.value.trim()
//     const title = this.activityTitleTarget.value.trim()
//     const local = this.activityLocalTarget.value.trim()
//     const speaker = this.activitySpeakerTarget.value.trim()
//     const period_start = this.activityPeriodStartTarget.value
//     const period_end = this.activityPeriodEndTarget.value
//     const certificate_hours = this.activityCertificateHoursTarget.value
//     const subscriptions_open = this.activitySubscriptionsOpenTarget.value

//     if (!name || !title) {
//       alert('Preencha pelo menos Nome e Título da atividade!')
//       return
//     }

    

//     let activities = JSON.parse(sessionStorage.getItem('activities')) || []
//     activities.push({
//       id: activities.length + 1,
//       name: name,
//       title: title,
//       local: local,
//       speaker: speaker,
//       period_start: period_start,
//       period_end: period_end,
//       certificate_hours: certificate_hours,
//       subscriptions_open: subscriptions_open
//     })
//     sessionStorage.setItem('activities', JSON.stringify(activities))

//     this.closeModal()
//     this.renderActivitiesList()
//   }

//   // Método auxiliar para formatar tamanho do arquivo
//   formatFileSize(bytes) {
//     if (bytes === 0) return '0 Bytes'
    
//     const k = 1024
//     const sizes = ['Bytes', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
    
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
//   }

//   renderActivitiesList() {
//     let activities = JSON.parse(sessionStorage.getItem('activities')) || []

//     const container = this.activitiesContainerTarget
//     container.innerHTML = "" // Limpa o container



//     // 2. Condição de lista vazia
//     if (activities.length === 0) {
//       container.innerHTML += '<p class="text-center">Nenhuma atividade cadastrada ainda.</p>'
//     } else {
//       // 3. Cria a lista de atividades (Mantendo a sua estrutura original)
//       let ul = document.createElement('ul')
//       ul.className = "list-group list-group-flush" // Remove classes col e row desnecessárias aqui

//       activities.forEach(activity => {
//         // Seu botão de ID dentro do LI estava quebrando o layout,
//         // então, estou reorganizando o LI para ter flexbox interno.
//         let li = document.createElement('li')
//         li.className = "list-group-item d-flex justify-content-between align-items-start" // Flexbox para alinhar conteúdo e botão de ID
//         li.id = `activity-${activity.id}`
        
//         // Conteúdo da Atividade
//         const contentDiv = document.createElement('div');
//         contentDiv.innerHTML = `
//             <strong>Nome:</strong> ${activity.name || ''} <br>
//             <strong>Responsável:</strong> ${activity.speaker || ''} <br>
//             <strong>Data de Início:</strong> ${activity.period_start || ''} <br>
//             <strong>Data de Término:</strong> ${activity.period_end || ''} <br>
//         `

//         // Botão ID (Re-utilizando sua lógica)
//         let editButton = document.createElement('button')
//         editButton.className = "btn btn-sm btn-primary ml-2" 
//         editButton.innerHTML = `<i class="bi bi-pencil"></i>`
//         editButton.addEventListener('click', () => {
//           this.editActivity(activity.id)
//         })

//         let removeButton = document.createElement('button')
//         removeButton.className = "btn btn-sm btn-danger ml-2" 
//         removeButton.innerHTML = `<i class="bi bi-trash"></i>`
//         removeButton.addEventListener('click', () => {
//           this.removeActivity(activity.id)
//         })

//         li.appendChild(contentDiv)
//         li.appendChild(editButton)
//         li.appendChild(removeButton)
//         ul.appendChild(li)
//       })
//       container.appendChild(ul)
//     }
//   }

//   editActivity(id) {
//     // Lógica para editar a atividade com o ID fornecido
//     this.activityIndex = JSON.parse(sessionStorage.getItem('activities')).findIndex(act => act.id === id)
//     let activity = JSON.parse(sessionStorage.getItem('activities'))[this.activityIndex]
//     this.activityNameTarget.value = activity.name
//     this.activityTitleTarget.value = activity.title
//     this.activityLocalTarget.value = activity.local
//     this.activitySpeakerTarget.value = activity.speaker
//     this.activityPeriodStartTarget.value = activity.period_start
//     this.activityPeriodEndTarget.value = activity.period_end
//     this.activityCertificateHoursTarget.value = activity.certificate_hours
//     this.activitySubscriptionsOpenTarget.value = activity.subscriptions_open

//     this.activitiesModalTarget.classList.remove("hidden")
//     this.addActivityButtonTarget.classList.add("hidden")
//     this.updateActivityButtonTarget.classList.remove("hidden")
//   }

//   updateActivity(event) {
//     event.preventDefault()
//     let activities = JSON.parse(sessionStorage.getItem('activities'))
//     activities[this.activityIndex] = {
//       id: activities[this.activityIndex].id,
//       name: this.activityNameTarget.value,
//       title: this.activityTitleTarget.value,
//       local: this.activityLocalTarget.value,
//       speaker: this.activitySpeakerTarget.value,
//       period_start: this.activityPeriodStartTarget.value,
//       period_end: this.activityPeriodEndTarget.value,
//       certificate_hours: this.activityCertificateHoursTarget.value,
//       subscriptions_open: this.activitySubscriptionsOpenTarget.value
//     }
//     sessionStorage.setItem('activities', JSON.stringify(activities))
//     //
//     // Lógica para atualizar a atividade
//     // (Semelhante ao addActivity, mas atualiza o item existente)

//     this.closeModal()
//     this.addActivityButtonTarget.classList.remove("hidden")
//     this.updateActivityButtonTarget.classList.add("hidden")
//     this.renderActivitiesList()
//   }

//   removeActivity(id) {
//     // Lógica para remover a atividade com o ID fornecido
//     let activities = JSON.parse(sessionStorage.getItem('activities'))
//     activities = activities.filter(act => act.id !== id)
//     sessionStorage.setItem('activities', JSON.stringify(activities))
//     this.renderActivitiesList()
//   }
//   // Validação simples
//   validateEventForm() {
//     const nameInput = this.eventFormTarget.querySelector('input[name*="[name]"]')
//     if (!nameInput.value.trim()) {
//       alert('Por favor, preencha o nome do evento')
//       return false
//     }
//     return true
//   }
// }

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

