// controllers/event_form_controller.js
import { Controller } from "@hotwired/stimulus"
import { Utils } from "../utils/utils"
import { TabNavigationManager } from "../managers/tab_navigation_manager"
import { EventDataManager } from "../managers/event_data_manager"
import { ActivitiesManager } from "../managers/activities_manager"
import { SummaryGenerator } from "../managers/summary_generator"
import { BackendCommunicator } from "../managers/backend_communicator"


const KEY_EVENT_DATA = "eventData"
const KEY_ACTIVITIES = "event_activities"

export default class extends Controller {
  static targets = [
    // Tabs
    "tabButton", "tabContent",

    // Formulário e dados
    "eventForm", "activitiesContainer", "activitiesModal",

    // Campos do modal de atividades
    "activityName", "activityTitle", "activityLocal", "activitySpeaker",
    "activityPeriodStart", "activityPeriodEnd", "activityCertificateHours", "activitySubscriptionsOpen",

    // Configurações da agenda
    "agendaDate", "timezone", "speakersList",

    // Preview
    "previewLocation", "previewTime", "previewDate",

    // Resumo do evento (publicar)
    "summaryEventName", "summaryEventDate", "summaryEventLocation", "summaryEventResponsible",
    "summaryEventEmail", "summaryEventBanner", "summarySessionsCount", "summaryAgenda",
    "summarySpeakersCount", "summarySpeakers", "statusBasic", "statusAgenda", "statusTickets",
    "completionProgress", "completionPercentage", "eventStatus"
  ]

  connect() {
    console.log("Event Form Controller conectado - Versão Completa")

    // Estado interno
    this.editingIndex = null
    this.originalBannerFile = null
    this.currentTab = "basico"
    this._lastBannerObjectUrl = null

    // Cria handlers vinculados (evita reatribuição em cada renderização)
    this._boundEditHandler = (e) => this._editActivity(e)
    this._boundRemoveHandler = (e) => this._removeActivity(e)

    // Inicializa managers
    this.initializeManagers()

    // Carrega dados persistidos (se houver)
    this.loadEventDataIfExists()

    // Renderiza atividades caso exista container
    try {
      this.renderActivitiesList()
    } catch (err) {
      console.warn("renderActivitiesList ainda não implementado ou falhou:", err)
    }
  }

  disconnect() {
    // Limpa object URLs ao desconectar (boa prática)
    if (this._lastBannerObjectUrl) {
      URL.revokeObjectURL(this._lastBannerObjectUrl)
      this._lastBannerObjectUrl = null
    }
  }

  // ===== INICIALIZAÇÃO DOS MANAGERS =====
  initializeManagers() {
    console.log("Inicializando managers...")

    // ✅ Fase 1 - Utils (ATIVO)
    this.utils = new Utils()

    // ✅ Fase 2 - TabNavigationManager (ATIVO)
    this.tabManager = new TabNavigationManager(this)

     // ✅ Fase 3 - EventDataManager (ATIVO)
    this.eventManager = new EventDataManager(this)

    // ✅ Fase 4 - ActivitiesManager (ATIVO)
    this.activitiesManager = new ActivitiesManager(this)

    // ✅ Fase 5 - SummaryGenerator (ATIVO)
    this.summaryGenerator = new SummaryGenerator(this)
    
    // ✅ Fase 6 - BackendCommunicator (ATIVO)
    this.backendCommunicator = new BackendCommunicator(this)

    console.log("🎉 Todos os managers inicializados com sucesso!")
  }

  // ===== API pública (delegates) =====
  switchTab(event) {
    return this.tabManager.switchTab(event)
  }

  saveAndNextTab() {
    this.tabManager.saveAndNextTab()
  }

  previousTab() {
    this.tabManager.previousTab()
  }
   // Modal de atividades
  openModal() {
    return this.activitiesManager.openModal()  // 👈 DELEGA
  }

  closeModal() {
    return this.activitiesManager.closeModal()  // 👈 DELEGA
  }

  // CRUD de atividades
  addActivity(event) {
    return this.activitiesManager.addActivity(event)  // 👈 DELEGA
  }

  editActivity(event) {
    return this.activitiesManager.editActivity(event)  // 👈 DELEGA
  }

  removeActivity(event) {
    return this.activitiesManager.removeActivity(event)  // 👈 DELEGA
  }

  // Renderização
  renderActivitiesList() {
    return this.activitiesManager.renderActivitiesList()  // 👈 DELEGA
  }

  // Dados
  getActivities() {
    return this.activitiesManager.getActivities()  // 👈 DELEGA
  }

  saveActivities(activities) {
    return this.activitiesManager.saveActivities(activities)  // 👈 DELEGA
  }


  // openModal() {
  //   this._openModal()
  // }

  // closeModal() {
  //   this._closeModal()
  // }

  // addActivity(event) {
  //   this._addActivity(event)
  // }

  // editActivity(event) {
  //   this._editActivity(event)
  // }

  // removeActivity(event) {
  //   this._removeActivity(event)
  // }

  publishEvent() {
    return this.backendCommunicator.publishEvent()  // 👈 DELEGA
  }

  saveDraft() {
    return this.backendCommunicator.saveDraft()  // 👈 DELEGA
  }

  previewEvent() {
    return this.backendCommunicator.previewEvent()  // 👈 DELEGA
  }

  // exportEvent() {
  //   this._exportEvent()
  // }

  // previewAgenda() {
  //   this._previewAgenda()
  // }

   // SUBSTITUA ESTES MÉTODOS:
  saveEventData() {
    return this.eventManager.saveEventData()  // 👈 DELEGA
  }

  loadEventDataIfExists() {
    return this.eventManager.loadEventData()  // 👈 DELEGA
  }

  getEventData() {
    return this.eventManager.getEventData()  // 👈 DELEGA
  }

  validateEventData(eventData) {
    return this.eventManager.validateEventData(eventData)  // 👈 DELEGA
  }

  exportEvent() {
    return this.eventManager.exportEventData()  // 👈 DELEGA
  }

   updateEventSummary() {
    return this.summaryGenerator.updateEventSummary()  // 👈 DELEGA
  }

  updateBasicInfo() {
    return this.summaryGenerator.updateBasicInfo()  // 👈 DELEGA
  }

  updateAgendaSummary() {
    return this.summaryGenerator.updateAgendaSummary()  // 👈 DELEGA
  }

  updateSpeakersSummary() {
    return this.summaryGenerator.updateSpeakersSummary()  // 👈 DELEGA
  }

  updateCompletionStatus() {
    return this.summaryGenerator.updateCompletionStatus()  // 👈 DELEGA
  }

  exportEvent() {
    return this.summaryGenerator.exportEventSummary()  // 👈 DELEGA (substitui o antigo)
  }

  // // ===== NAVEGAÇÃO DE TABS =====
  // _switchTab(event) {
  //   const targetTab = event.currentTarget.dataset.tab
  //   this._showTab(targetTab)
  // }

  // _showTab(tabName) {
  //   console.log(`Mudando para tab: ${tabName}`)

  //   // Atualiza botões das tabs
  //   try {
  //     ;(this.tabButtonTargets || []).forEach(button => {
  //       const isActive = button.dataset.tab === tabName
  //       button.classList.toggle("active", isActive)
  //     })
  //   } catch (err) {
  //     console.error("Erro ao atualizar tabButtonTargets:", err)
  //   }

  //   // Atualiza conteúdos das tabs
  //   try {
  //     ;(this.tabContentTargets || []).forEach(content => {
  //       const isActive = content.dataset.tab === tabName
  //       content.classList.toggle("show", isActive)
  //       content.classList.toggle("active", isActive)
  //     })
  //   } catch (err) {
  //     console.error("Erro ao atualizar tabContentTargets:", err)
  //   }

  //   this.currentTab = tabName

  //   if (tabName === "agenda") {
  //     // Re-renderiza a lista de atividades ao abrir Agenda
  //     if (typeof this.renderActivitiesList === "function") {
  //       this.renderActivitiesList()
  //     }
  //   }

  //   if (tabName === "publicar") {
  //     // Atualiza resumo ao abrir Publicar
  //     this.updateEventSummary()
  //   }
  // }

  // _saveAndNextTab() {
  //   if (this.currentTab === "basico") {
  //     this.saveEventData()
  //     this._showTab("agenda")
  //   } else if (this.currentTab === "agenda") {
  //     this._showTab("ingressos")
  //   } else if (this.currentTab === "ingressos") {
  //     this._showTab("publicar")
  //   }
  // }

  // _previousTab() {
  //   if (this.currentTab === "agenda") {
  //     this._showTab("basico")
  //   } else if (this.currentTab === "ingressos") {
  //     this._showTab("agenda")
  //   } else if (this.currentTab === "publicar") {
  //     this._showTab("ingressos")
  //   }
  // }

  // ===== SALVAMENTO E CARREGAMENTO DO FORMULÁRIO =====
  // saveEventData() {
  //   // Prefere target declarado; fallback com escopo do elemento
  //   const form = (this.hasEventFormTarget && this.eventFormTarget)
  //     ? this.eventFormTarget
  //     : this.element.querySelector('form')

  //   if (!form) {
  //     console.warn("Form não encontrado para salvar dados.")
  //     return
  //   }

  //   const formData = new FormData(form)
  //   const eventData = this.getEventData() || {}

  //   // Atualiza campos normais
  //   formData.forEach((value, key) => {
  //     if (key === 'event[banner]') return
  //     const cleanKey = key.replace(/^event\[/, '').replace(/\]$/, '')
  //     eventData[cleanKey] = value
  //   })

  //   // Processa banner (arquivo) — guarda preview e metadados, não o File
  //   const bannerInput = form.querySelector('input[name="event[banner]"]')
  //   if (bannerInput && bannerInput.files && bannerInput.files.length > 0) {
  //     const file = bannerInput.files[0]
  //     this.originalBannerFile = file

  //     // Revoga object URL anterior para evitar memory leak
  //     if (this._lastBannerObjectUrl) {
  //       URL.revokeObjectURL(this._lastBannerObjectUrl)
  //     }

  //     const imageUrl = URL.createObjectURL(file)
  //     this._lastBannerObjectUrl = imageUrl

  //     eventData.bannerUrl = imageUrl
  //     eventData.bannerName = file.name
  //     eventData.bannerSize = file.size
  //     eventData.hasBanner = true

  //     console.log('Banner guardado (preview):', file.name)
  //   } else {
  //     // Mantém banner anterior se existir
  //     if (!eventData.bannerUrl) {
  //       eventData.hasBanner = false
  //       this.originalBannerFile = null
  //     }
  //   }

  //   this.setEventData(eventData)
  //   console.log("Dados do evento salvos em sessionStorage:", eventData)
  // }

  // loadEventDataIfExists() {
  //   const eventData = this.getEventData()
  //   if (!eventData) return

  //   const form = (this.hasEventFormTarget && this.eventFormTarget)
  //     ? this.eventFormTarget
  //     : this.element.querySelector('form')

  //   if (!form) return

  //   // Preenche inputs existentes no form
  //   Object.entries(eventData).forEach(([key, value]) => {
  //     // Ignora campos que são metadados de banner
  //     if (key === "bannerUrl" || key === "bannerName" || key === "bannerSize") return

  //     const input = form.querySelector(`[name="event[${key}]"]`)
  //     if (input) {
  //       try {
  //         input.value = value
  //       } catch (err) {
  //         console.warn("Erro ao preencher input", key, err)
  //       }
  //     }
  //   })

  //   // Se houver preview de banner salvo, tente mostrar (se existir um elemento preview)
  //   if (eventData.bannerUrl) {
  //     if (this.hasSummaryEventBannerTarget) {
  //       try {
  //         const img = this.summaryEventBannerTarget
  //         if (img.tagName && img.tagName.toLowerCase() === "img") {
  //           img.src = eventData.bannerUrl
  //         } else {
  //           // se não for <img>, insere como background
  //           img.style.backgroundImage = `url('${eventData.bannerUrl}')`
  //         }
  //       } catch (err) {
  //         console.warn("Erro ao aplicar banner preview:", err)
  //       }
  //     }
  //   }

  //   console.log("Dados do evento carregados do sessionStorage.")
  // }

  // ===== GERENCIAMENTO DE ATIVIDADES (Agenda) =====
  // getActivities() {
  //   try {
  //     const raw = sessionStorage.getItem(KEY_ACTIVITIES)
  //     return raw ? JSON.parse(raw) : []
  //   } catch (err) {
  //     console.error("Erro ao parsear activities do sessionStorage:", err)
  //     return []
  //   }
  // }

  // setActivities(list) {
  //   try {
  //     sessionStorage.setItem(KEY_ACTIVITIES, JSON.stringify(list || []))
  //   } catch (err) {
  //     console.error("Erro ao gravar activities no sessionStorage:", err)
  //   }
  // }

  // renderActivitiesList() {
  //   if (!this.hasActivitiesContainerTarget) {
  //     // nada a renderizar se não houver target
  //     return
  //   }

  //   const container = this.activitiesContainerTarget
  //   const activities = this.getActivities()

  //   if (!activities || activities.length === 0) {
  //     container.innerHTML = `<div class="text-muted">Nenhuma sessão adicionada</div>`
  //     if (this.hasSummarySessionsCountTarget) this.summarySessionsCountTarget.textContent = "0"
  //     return
  //   }

  //   // Render simplificado
  //   container.innerHTML = activities.map((a, idx) => {
  //     const title = a.title || a.name || "Sem título"
  //     const speaker = a.speaker || ""
  //     const local = a.local || ""
  //     const start = a.start || ""
  //     const end = a.end || ""
  //     return `
  //       <div class="card mb-2 activity-item" data-activity-index="${idx}">
  //         <div class="card-body p-2 d-flex justify-content-between align-items-center">
  //           <div>
  //             <div class="fw-bold">${title}</div>
  //             <small class="text-muted">${speaker} • ${local} • ${start}${end ? "–" + end : ""}</small>
  //           </div>
  //           <div class="btn-group">
  //             <button type="button" class="btn btn-sm btn-outline-primary activity-edit-btn" data-index="${idx}">Editar</button>
  //             <button type="button" class="btn btn-sm btn-outline-danger activity-remove-btn" data-index="${idx}">Remover</button>
  //           </div>
  //         </div>
  //       </div>
  //     `
  //   }).join("")

  //   // Adiciona event listeners (usa handlers vinculados criados no connect)
  //   container.querySelectorAll(".activity-edit-btn").forEach(btn => {
  //     btn.removeEventListener("click", this._boundEditHandler)
  //     btn.addEventListener("click", this._boundEditHandler)
  //   })

  //   container.querySelectorAll(".activity-remove-btn").forEach(btn => {
  //     btn.removeEventListener("click", this._boundRemoveHandler)
  //     btn.addEventListener("click", this._boundRemoveHandler)
  //   })

  //   if (this.hasSummarySessionsCountTarget) {
  //     this.summarySessionsCountTarget.textContent = String(activities.length)
  //   }
  // }

  // _openModal() {
  //   if (!this.hasActivitiesModalTarget) {
  //     console.warn("Modal de atividades não encontrado.")
  //     return
  //   }

  //   // Se editingIndex está setado, preenche os campos com os dados existentes
  //   if (this.editingIndex !== null && this.editingIndex !== undefined) {
  //     const activities = this.getActivities()
  //     const item = activities[this.editingIndex]
  //     if (item) {
  //       // Preenche campos do modal (proteções com hasXTarget)
  //       if (this.hasActivityNameTarget) this.activityNameTarget.value = item.name || item.title || ""
  //       if (this.hasActivityTitleTarget) this.activityTitleTarget.value = item.title || item.name || ""
  //       if (this.hasActivityLocalTarget) this.activityLocalTarget.value = item.local || ""
  //       if (this.hasActivitySpeakerTarget) this.activitySpeakerTarget.value = item.speaker || ""
  //       if (this.hasActivityPeriodStartTarget) this.activityPeriodStartTarget.value = item.start || ""
  //       if (this.hasActivityPeriodEndTarget) this.activityPeriodEndTarget.value = item.end || ""
  //       if (this.hasActivityCertificateHoursTarget) this.activityCertificateHoursTarget.value = item.certificate_hours || ""
  //       if (this.hasActivitySubscriptionsOpenTarget) this.activitySubscriptionsOpenTarget.checked = !!item.subscriptions_open
  //     }
  //   } else {
  //     this.clearModalFields()
  //   }

  //   this.activitiesModalTarget.classList.remove("hidden")
  // }

  // _closeModal() {
  //   if (!this.hasActivitiesModalTarget) return
  //   this.activitiesModalTarget.classList.add("hidden")
  //   this.clearModalFields()
  //   this.editingIndex = null
  // }

  // clearModalFields() {
  //   if (this.hasActivityNameTarget) this.activityNameTarget.value = ""
  //   if (this.hasActivityTitleTarget) this.activityTitleTarget.value = ""
  //   if (this.hasActivityLocalTarget) this.activityLocalTarget.value = ""
  //   if (this.hasActivitySpeakerTarget) this.activitySpeakerTarget.value = ""
  //   if (this.hasActivityPeriodStartTarget) this.activityPeriodStartTarget.value = ""
  //   if (this.hasActivityPeriodEndTarget) this.activityPeriodEndTarget.value = ""
  //   if (this.hasActivityCertificateHoursTarget) this.activityCertificateHoursTarget.value = ""
  //   if (this.hasActivitySubscriptionsOpenTarget) this.activitySubscriptionsOpenTarget.checked = false
  // }

  // Chamado quando o botão "Salvar" do modal é clicado
  // _addActivity(event) {
  //   event && event.preventDefault && event.preventDefault()

  //   const activities = this.getActivities()

  //   // Lê campos do modal (com proteção)
  //   const item = {
  //     name: this.hasActivityNameTarget ? this.activityNameTarget.value.trim() : "",
  //     title: this.hasActivityTitleTarget ? this.activityTitleTarget.value.trim() : "",
  //     local: this.hasActivityLocalTarget ? this.activityLocalTarget.value.trim() : "",
  //     speaker: this.hasActivitySpeakerTarget ? this.activitySpeakerTarget.value.trim() : "",
  //     start: this.hasActivityPeriodStartTarget ? this.activityPeriodStartTarget.value : "",
  //     end: this.hasActivityPeriodEndTarget ? this.activityPeriodEndTarget.value : "",
  //     certificate_hours: this.hasActivityCertificateHoursTarget ? this.activityCertificateHoursTarget.value : "",
  //     subscriptions_open: this.hasActivitySubscriptionsOpenTarget ? !!this.activitySubscriptionsOpenTarget.checked : false
  //   }

  //   if (this.editingIndex !== null && this.editingIndex !== undefined) {
  //     // Atualiza atividade existente
  //     activities[this.editingIndex] = item
  //     this.editingIndex = null
  //   } else {
  //     // Adiciona nova
  //     activities.push(item)
  //   }

  //   this.setActivities(activities)
  //   this.renderActivitiesList()
  //   this._closeModal()
  // }

  // _editActivity(event) {
  //   // Pega índice do elemento clicado
  //   const index = Number(event.currentTarget?.dataset?.index ?? event.target?.dataset?.index)
  //   if (Number.isNaN(index)) {
  //     console.warn("Índice inválido ao editar atividade:", event)
  //     return
  //   }
  //   this.editingIndex = index
  //   this._openModal()
  // }

  // _removeActivity(event) {
  //   const index = Number(event.currentTarget?.dataset?.index ?? event.target?.dataset?.index)
  //   if (Number.isNaN(index)) {
  //     console.warn("Índice inválido ao remover atividade:", event)
  //     return
  //   }
  //   const activities = this.getActivities()
  //   activities.splice(index, 1)
  //   this.setActivities(activities)
  //   this.renderActivitiesList()
  // }

  // ===== HELPERS PARA EVENT DATA =====
  // getEventData() {
  //   const raw = sessionStorage.getItem(KEY_EVENT_DATA)
  //   if (!raw) return null

  //   try {
  //     return JSON.parse(raw)
  //   } catch (err) {
  //     console.error("Erro ao parsear eventData do session", err)
  //   }
  // }

  // setEventData(payload) {
  //   try {
  //     sessionStorage.setItem(KEY_EVENT_DATA, JSON.stringify(payload || {}))
  //   } catch (err) {
  //     console.error("Erro ao gravar eventData no sessionStorage:", err)
  //   }
  // }

  // // ===== UPDATE DO RESUMO (Publicar) =====
  // updateEventSummary() {
  //   const eventData = this.getEventData() || {}
  //   const activities = this.getActivities()

  //   // Nome
  //   if (this.hasSummaryEventNameTarget) {
  //     this.summaryEventNameTarget.textContent = eventData.title || eventData.name || "—"
  //   }

  //   // Data (tenta usar campos conhecidos)
  //   if (this.hasSummaryEventDateTarget) {
  //     const date = eventData.date || eventData.start_date || eventData.event_date || ""
  //     this.summaryEventDateTarget.textContent = date || "—"
  //   }

  //   // Local
  //   if (this.hasSummaryEventLocationTarget) {
  //     this.summaryEventLocationTarget.textContent = eventData.location || "—"
  //   }

  //   // Responsável / email
  //   if (this.hasSummaryEventResponsibleTarget) {
  //     this.summaryEventResponsibleTarget.textContent = eventData.responsible || eventData.owner || "—"
  //   }
  //   if (this.hasSummaryEventEmailTarget) {
  //     this.summaryEventEmailTarget.textContent = eventData.contact_email || eventData.email || "—"
  //   }

  //   // Banner
  //   if (this.hasSummaryEventBannerTarget) {
  //     try {
  //       const el = this.summaryEventBannerTarget
  //       if (el.tagName && el.tagName.toLowerCase() === "img") {
  //         el.src = eventData.bannerUrl || ""
  //       } else {
  //         el.style.backgroundImage = eventData.bannerUrl ? `url('${eventData.bannerUrl}')` : ""
  //       }
  //     } catch (err) {
  //       console.warn("Erro ao atualizar summaryEventBannerTarget:", err)
  //     }
  //   }

  //   // Sessões / agenda summary
  //   if (this.hasSummarySessionsCountTarget) {
  //     this.summarySessionsCountTarget.textContent = String((activities && activities.length) || 0)
  //   }

  //   if (this.hasSummaryAgendaTarget) {
  //     if (!activities || activities.length === 0) {
  //       this.summaryAgendaTarget.innerHTML = "<div class='text-muted'>Nenhuma sessão</div>"
  //     } else {
  //       // Monta uma lista simples para o resumo
  //       const html = activities.map(a => {
  //         const title = a.title || a.name || "Sem título"
  //         const speaker = a.speaker ? ` — ${a.speaker}` : ""
  //         const start = a.start ? ` (${a.start}${a.end ? "–" + a.end : ""})` : ""
  //         return `<div class="summary-session"><strong>${title}</strong>${speaker}<span class="text-muted">${start}</span></div>`
  //       }).join("")
  //       this.summaryAgendaTarget.innerHTML = html
  //     }
  //   }

  //   // Palestrantes: extrai lista única de speakers
  //   if (this.hasSummarySpeakersCountTarget || this.hasSummarySpeakersTarget) {
  //     const speakers = new Set()
  //     ;(activities || []).forEach(a => {
  //       if (a.speaker) {
  //         // pode ser uma string com vírgula — basic split, trim
  //         a.speaker.split?.(",")?.forEach(s => {
  //           const t = String(s).trim()
  //           if (t) speakers.add(t)
  //         }) || speakers.add(a.speaker)
  //       }
  //     })
  //     const speakersArr = Array.from(speakers)
  //     if (this.hasSummarySpeakersCountTarget) this.summarySpeakersCountTarget.textContent = String(speakersArr.length)
  //     if (this.hasSummarySpeakersTarget) this.summarySpeakersTarget.innerHTML = speakersArr.length ? `<ul>${speakersArr.map(s => `<li>${s}</li>`).join("")}</ul>` : "<div class='text-muted'>Nenhum palestrante</div>"
  //   }

  //   // Status de completude — heurística simples
  //   const totalChecks = 3 // ex: básico, agenda, ingressos
  //   let done = 0
  //   // Básico: título, data e local
  //   if (eventData.title && (eventData.date || eventData.start_date) && (eventData.location || eventData.venue)) done++
  //   // Agenda: pelo menos 1 atividade
  //   if ((activities || []).length > 0) done++
  //   // Tickets: checagem minimal (configuração de ingressos não implementada)
  //   // done stays

  //   const percent = Math.round((done / totalChecks) * 100)
  //   if (this.hasCompletionProgressTarget) {
  //     try {
  //       this.completionProgressTarget.style.width = `${percent}%`
  //     } catch (err) {
  //       // caso seja um elemento sem style (ex: <span>), configura texto fallback
  //       this.completionProgressTarget.textContent = `${percent}%`
  //     }
  //   }
  //   if (this.hasCompletionPercentageTarget) {
  //     this.completionPercentageTarget.textContent = `${percent}%`
  //   }

  //   // Event status (placeholder)
  //   if (this.hasEventStatusTarget) {
  //     this.eventStatusTarget.textContent = eventData.published ? "Publicado" : "Rascunho"
  //   }
  // }

  // ===== MÉTODOS AUXILIARES PARA OS MANAGERS =====

  // Getters para os managers acessarem os targets (SEM conflito com Stimulus)
  getTargetsMap() {
    return {
      tabButton: this.tabButtonTargets,
      tabContent: this.tabContentTargets,
      activitiesContainer: this.activitiesContainerTarget,
      activitiesModal: this.activitiesModalTarget,
      eventForm: this.hasEventFormTarget ? this.eventFormTarget : null,
      activityName: this.activityNameTarget,
      activityTitle: this.activityTitleTarget,
      activityLocal: this.activityLocalTarget,
      activitySpeaker: this.activitySpeakerTarget,
      activityPeriodStart: this.activityPeriodStartTarget,
      activityPeriodEnd: this.activityPeriodEndTarget,
      activityCertificateHours: this.activityCertificateHoursTarget,
      activitySubscriptionsOpen: this.activitySubscriptionsOpenTarget,
      speakersList: this.speakersListTarget,
      previewLocation: this.previewLocationTarget,
      previewTime: this.previewTimeTarget,
      previewDate: this.previewDateTarget,
    }
  }

  // Método para managers acessarem o estado
  getState() {
    return {
      editingIndex: this.editingIndex,
      currentTab: this.currentTab,
      originalBannerFile: this.originalBannerFile
    }
  }

  // Método para managers modificarem o estado
  setState(newState) {
    Object.assign(this, newState)
  }

  // Helpers de formatação (delegam para Utils)
  formatTime(dateString) {
    return this.utils.formatTime(dateString)
  }

  formatDate(dateString) {
    return this.utils.formatDate(dateString)
  }

  formatFileSize(bytes) {
    return this.utils.formatFileSize(bytes)
  }

  // // ===== STUBS / BACKEND (seguro) =====
  // _publishEvent() {
  //   console.log("Ação publicar chamada — implemente envio ao backend aqui.")
  //   // exemplo: coletar this.getEventData() + activities e enviar
  // }

  // _saveDraft() {
  //   console.log("Salvar rascunho (local) — se quiser enviar ao backend implemente aqui.")
  // }

  // _previewEvent() {
  //   console.log("Preview (local) — implementar rota de preview se quiser.")
  // }

  // _exportEvent() {
  //   console.log("Exportar evento — implementar exportador (JSON / PDF) se quiser.")
  // }

  // _previewAgenda() {
  //   console.log("Preview da agenda — implementar view ou modal conforme necessário.")
  // }
}
