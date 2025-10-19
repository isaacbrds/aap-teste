import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "eventForm",
    "activitiesList",
    "activitiesModal",
    "activitiesContainer",
    "activityName",
    "activityTitle",
    "activityLocal",
    "activitySpeaker",
    "activityPeriodStart",
    "activityPeriodEnd",
    "activityCertificateHours",
    "activitySubscriptionsOpen",
    "addActivityButton",
    "updateActivityButton"
  ]

  connect() {
    this.showEventForm()
    this.renderActivitiesList()
    this.activityIndex = 0
  }

  // Ao clicar em Próximo: salva dados do evento e mostra as atividades
  nextToActivities(event) {
    event.preventDefault()
    console.log("Indo para atividades")
    if (this.validateEventForm()) {
      const formData = new FormData(this.eventFormTarget.querySelector('form'))
      const eventData = {}
      formData.forEach((value, key) => {
        eventData[key] = value
      })
      // Salva como string
      sessionStorage.setItem('eventData', JSON.stringify(eventData))
      this.hideEventForm()
      this.showActivitiesList()
    }
  }

  // Volta para o formulário do evento
  backToEvent(event) {
    event.preventDefault()
    this.hideActivitiesList()
    this.showEventForm()
  }

  showEventForm() {
    this.eventFormTarget.classList.remove("hidden")
    if(sessionStorage.getItem('eventData')) {
      const eventData = JSON.parse(sessionStorage.getItem('eventData'))
      const form = this.eventFormTarget.querySelector('form')
      for (const [key, value] of Object.entries(eventData)) {
        const input = form.querySelector(`[name="${key}"]`)
        if (input) {
          input.value = value
        }
      }
    }
    this.activitiesListTarget.classList.add("hidden")
  }

  hideEventForm() {
    this.eventFormTarget.classList.add("hidden")
  }

  showActivitiesList() {
    this.activitiesListTarget.classList.remove("hidden")
    this.renderActivitiesList()
  }

  hideActivitiesList() {
    this.activitiesListTarget.classList.add("hidden")
  }

  // ------ Atividades ------
  openModal() {
    this.activitiesModalTarget.classList.remove("hidden")
    console.log(this.activitiesModalTarget);
    console.log("Abrindo modal de atividades")
    // Limpa o modal
    this.limpaModal()
  }

  limpaModal() {
    this.activityNameTarget.value = ''
    this.activityTitleTarget.value = ''
    this.activityLocalTarget.value = ''
    this.activitySpeakerTarget.value = ''
    this.activityPeriodStartTarget.value = ''
    this.activityPeriodEndTarget.value = ''
    this.activityCertificateHoursTarget.value = ''
    this.activitySubscriptionsOpenTarget.value = ''
  }

  closeModal() {
    this.activitiesModalTarget.classList.add("hidden")
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

    

    let activities = JSON.parse(sessionStorage.getItem('activities')) || []
    activities.push({
      id: activities.length + 1,
      name: name,
      title: title,
      local: local,
      speaker: speaker,
      period_start: period_start,
      period_end: period_end,
      certificate_hours: certificate_hours,
      subscriptions_open: subscriptions_open
    })
    sessionStorage.setItem('activities', JSON.stringify(activities))

    this.closeModal()
    this.renderActivitiesList()
  }

  renderActivitiesList() {
    let activities = JSON.parse(sessionStorage.getItem('activities')) || []

    const container = this.activitiesContainerTarget
    container.innerHTML = "" // Limpa o container



    // 2. Condição de lista vazia
    if (activities.length === 0) {
      container.innerHTML += '<p class="text-center">Nenhuma atividade cadastrada ainda.</p>'
    } else {
      // 3. Cria a lista de atividades (Mantendo a sua estrutura original)
      let ul = document.createElement('ul')
      ul.className = "list-group list-group-flush" // Remove classes col e row desnecessárias aqui

      activities.forEach(activity => {
        // Seu botão de ID dentro do LI estava quebrando o layout,
        // então, estou reorganizando o LI para ter flexbox interno.
        let li = document.createElement('li')
        li.className = "list-group-item d-flex justify-content-between align-items-start" // Flexbox para alinhar conteúdo e botão de ID
        li.id = `activity-${activity.id}`
        
        // Conteúdo da Atividade
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = `
            <strong>Nome:</strong> ${activity.name || ''} <br>
            <strong>Responsável:</strong> ${activity.speaker || ''} <br>
            <strong>Data de Início:</strong> ${activity.period_start || ''} <br>
            <strong>Data de Término:</strong> ${activity.period_end || ''} <br>
        `

        // Botão ID (Re-utilizando sua lógica)
        let editButton = document.createElement('button')
        editButton.className = "btn btn-sm btn-primary ml-2" 
        editButton.innerHTML = `<i class="bi bi-pencil"></i>`
        editButton.addEventListener('click', () => {
          this.editActivity(activity.id)
        })

        let removeButton = document.createElement('button')
        removeButton.className = "btn btn-sm btn-danger ml-2" 
        removeButton.innerHTML = `<i class="bi bi-trash"></i>`
        removeButton.addEventListener('click', () => {
          this.removeActivity(activity.id)
        })

        li.appendChild(contentDiv)
        li.appendChild(editButton)
        li.appendChild(removeButton)
        ul.appendChild(li)
      })
      container.appendChild(ul)
    }
  }

  editActivity(id) {
    // Lógica para editar a atividade com o ID fornecido
    this.activityIndex = JSON.parse(sessionStorage.getItem('activities')).findIndex(act => act.id === id)
    let activity = JSON.parse(sessionStorage.getItem('activities'))[this.activityIndex]
    this.activityNameTarget.value = activity.name
    this.activityTitleTarget.value = activity.title
    this.activityLocalTarget.value = activity.local
    this.activitySpeakerTarget.value = activity.speaker
    this.activityPeriodStartTarget.value = activity.period_start
    this.activityPeriodEndTarget.value = activity.period_end
    this.activityCertificateHoursTarget.value = activity.certificate_hours
    this.activitySubscriptionsOpenTarget.value = activity.subscriptions_open

    this.activitiesModalTarget.classList.remove("hidden")
    this.addActivityButtonTarget.classList.add("hidden")
    this.updateActivityButtonTarget.classList.remove("hidden")
  }

  updateActivity(event) {
    event.preventDefault()
    let activities = JSON.parse(sessionStorage.getItem('activities'))
    activities[this.activityIndex] = {
      id: activities[this.activityIndex].id,
      name: this.activityNameTarget.value,
      title: this.activityTitleTarget.value,
      local: this.activityLocalTarget.value,
      speaker: this.activitySpeakerTarget.value,
      period_start: this.activityPeriodStartTarget.value,
      period_end: this.activityPeriodEndTarget.value,
      certificate_hours: this.activityCertificateHoursTarget.value,
      subscriptions_open: this.activitySubscriptionsOpenTarget.value
    }
    sessionStorage.setItem('activities', JSON.stringify(activities))
    //
    // Lógica para atualizar a atividade
    // (Semelhante ao addActivity, mas atualiza o item existente)

    this.closeModal()
    this.addActivityButtonTarget.classList.remove("hidden")
    this.updateActivityButtonTarget.classList.add("hidden")
    this.renderActivitiesList()
  }

  removeActivity(id) {
    // Lógica para remover a atividade com o ID fornecido
    let activities = JSON.parse(sessionStorage.getItem('activities'))
    activities = activities.filter(act => act.id !== id)
    sessionStorage.setItem('activities', JSON.stringify(activities))
    this.renderActivitiesList()
  }
  // Validação simples
  validateEventForm() {
    const nameInput = this.eventFormTarget.querySelector('input[name*="[name]"]')
    if (!nameInput.value.trim()) {
      alert('Por favor, preencha o nome do evento')
      return false
    }
    return true
  }
}
