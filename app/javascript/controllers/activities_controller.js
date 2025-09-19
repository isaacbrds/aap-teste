// app/javascript/controllers/activities_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "container", "counter", "emptyState", "activity",
    "modalForm", "modalTitle", "saveButton", "saveButtonText",
    "nameInput", "titleInput", "speakerInput", "localInput",
    "startInput", "endInput", "hoursInput", "subscriptionsInput"
  ]
  
  static values = { 
    count: Number,
    editingIndex: Number
  }

  connect() {
    console.log("Activities controller conectado! ✅")
    this.countValue = this.activityTargets.length || 0
    this.editingIndexValue = -1
    this.updateCounter()
    this.toggleEmptyState()
  }

  openModal() {
    console.log("Abrindo modal...")
    
    this.editingIndexValue = -1
    
    if (this.hasModalTitleTarget) {
      this.modalTitleTarget.innerHTML = '<i class="fas fa-plus me-2"></i>Nova Atividade'
    }
    
    if (this.hasSaveButtonTextTarget) {
      this.saveButtonTextTarget.textContent = 'Adicionar Atividade'
    }
    
    this.clearForm()
  }

  editActivity(event) {
    const index = parseInt(event.currentTarget.dataset.index)
    this.editingIndexValue = index
    
    if (this.hasModalTitleTarget) {
      this.modalTitleTarget.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Atividade'
    }
    
    if (this.hasSaveButtonTextTarget) {
      this.saveButtonTextTarget.textContent = 'Salvar Alterações'
    }
    
    const activityCard = this.activityTargets[index]
    this.populateForm(activityCard)
  }

  saveActivity() {
    console.log("Salvando atividade...")
    
    if (!this.validateForm()) {
      console.log("Validação falhou")
      return
    }

    const activityData = this.getFormData()
    console.log("Dados da atividade:", activityData)
    
    if (this.editingIndexValue >= 0) {
      this.updateActivity(this.editingIndexValue, activityData)
      this.showAlert('Atividade atualizada com sucesso!', 'success')
    } else {
      this.addNewActivity(activityData)
      this.showAlert('Atividade adicionada com sucesso!', 'success')
    }
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('activityModal'))
    if (modal) {
      modal.hide()
    }
  }

  async addNewActivity(activityData) {

    const activityHtml = this.createActivityCardHTML(activityData, this.countValue)
    
    this.containerTarget.insertAdjacentHTML('beforeend', activityHtml)
    this.countValue++
    
    this.updateCounter()
    this.toggleEmptyState()
    
    // Scroll para nova atividade
    const newActivity = this.containerTarget.lastElementChild
    newActivity.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    // Animar entrada
    newActivity.style.opacity = '0'
    newActivity.style.transform = 'translateY(20px)'
    setTimeout(() => {
      newActivity.style.transition = 'all 0.3s ease'
      newActivity.style.opacity = '1'
      newActivity.style.transform = 'translateY(0)'
    }, 50)
  }

  updateActivity(index, activityData) {
    const activityCard = this.activityTargets[index]
    const newActivityHtml = this.createActivityCardHTML(activityData, index)
    
    activityCard.outerHTML = newActivityHtml
    
    // Flash de sucesso
    setTimeout(() => {
      const updatedCard = this.activityTargets[index]
      if (updatedCard) {
        updatedCard.classList.add('border-success')
        setTimeout(() => {
          updatedCard.classList.remove('border-success')
        }, 2000)
      }
    }, 100)
  }

  removeActivity(event) {
    const index = parseInt(event.currentTarget.dataset.index)
    const activityCard = this.activityTargets[index]
    
    if (this.activityTargets.length <= 1) {
      this.showAlert('Deve haver pelo menos uma atividade no evento', 'warning')
      return
    }

    if (confirm('Tem certeza que deseja remover esta atividade?')) {
      activityCard.style.transition = 'all 0.3s ease-out'
      activityCard.style.opacity = '0'
      activityCard.style.transform = 'translateX(-100%)'
      
      setTimeout(() => {
        activityCard.remove()
        this.reindexActivities()
        this.updateCounter()
        this.toggleEmptyState()
        this.showAlert('Atividade removida com sucesso!', 'info')
      }, 300)
    }
  }

  clearForm() {
    if (this.hasNameInputTarget) this.nameInputTarget.value = ''
    if (this.hasTitleInputTarget) this.titleInputTarget.value = ''
    if (this.hasSpeakerInputTarget) this.speakerInputTarget.value = ''
    if (this.hasLocalInputTarget) this.localInputTarget.value = ''
    if (this.hasStartInputTarget) this.startInputTarget.value = ''
    if (this.hasEndInputTarget) this.endInputTarget.value = ''
    if (this.hasHoursInputTarget) this.hoursInputTarget.value = ''
    if (this.hasSubscriptionsInputTarget) this.subscriptionsInputTarget.checked = false
    
    // Limpar validações
    if (this.hasModalFormTarget) {
      this.modalFormTarget.classList.remove('was-validated')
      this.modalFormTarget.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'))
    }
  }

  validateForm() {
    console.log("hasModalFormTarget:", this.hasModalFormTarget);
    if (!this.hasModalFormTarget) return false
    
    let isValid = true
    
    // Limpar validações anteriores
    this.modalFormTarget.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'))
    this.modalFormTarget.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '')
    
    // Validar nome (obrigatório)
    if (this.hasNameInputTarget) {
      if (!this.nameInputTarget.value.trim()) {
        this.setFieldError(this.nameInputTarget, 'Nome da atividade é obrigatório')
        isValid = false
      }
    }

    // Validar local (obrigatório)
    if (this.hasLocalInputTarget) {
      if (!this.localInputTarget.value.trim()) {
        this.setFieldError(this.localInputTarget, 'Local da atividade é obrigatório')
        isValid = false
      }
    }

    // Validar título (obrigatório)
    if (this.hasTitleInputTarget) {
      if (!this.titleInputTarget.value.trim()) {
        this.setFieldError(this.titleInputTarget, 'Título da atividade é obrigatório')
        isValid = false
      }
    }

// Validar Speaker (obrigatório)
    if (this.hasSpeakerInputTarget) {
      if (!this.speakerInputTarget.value.trim()) {
        this.setFieldError(this.speakerInputTarget, 'Palestrante da atividade é obrigatório')
        isValid = false
      }
    }

    // Validar Speaker (obrigatório)
    if (this.hasHoursInputTarget) {
      if (!this.hoursInputTarget.value.trim()) {
        this.setFieldError(this.hoursInputTarget, 'Carga horária da atividade é obrigatória')
        isValid = false
      }
    }
    
    
    // Validar data de início (obrigatório)
    if (this.hasStartInputTarget) {
      if (!this.startInputTarget.value) {
        this.setFieldError(this.startInputTarget, 'Data e hora de início são obrigatórias')
        isValid = false
      }
    }
    
    // Validar data de término (obrigatório)
    if (this.hasEndInputTarget) {
      if (!this.endInputTarget.value) {
        this.setFieldError(this.endInputTarget, 'Data e hora de término são obrigatórias')
        isValid = false
      }
    }
    
    // Validar se término é posterior ao início
    if (this.hasStartInputTarget && this.hasEndInputTarget && 
        this.startInputTarget.value && this.endInputTarget.value) {
      const startTime = new Date(this.startInputTarget.value)
      const endTime = new Date(this.endInputTarget.value)
      
      if (endTime <= startTime) {
        this.setFieldError(this.endInputTarget, 'Horário de término deve ser posterior ao início')
        isValid = false
      }
    }
    
    // Scroll para o primeiro erro
    if (!isValid) {
      const firstError = this.modalFormTarget.querySelector('.is-invalid')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstError.focus()
      }
    }
    
    return isValid
  }

  getFormData() {
    return {
      name: this.hasNameInputTarget ? this.nameInputTarget.value : '',
      title: this.hasTitleInputTarget ? this.titleInputTarget.value : '',
      speaker: this.hasSpeakerInputTarget ? this.speakerInputTarget.value : '',
      local: this.hasLocalInputTarget ? this.localInputTarget.value : '',
      period_start: this.hasStartInputTarget ? this.startInputTarget.value : '',
      period_end: this.hasEndInputTarget ? this.endInputTarget.value : '',
      certificate_hours: this.hasHoursInputTarget ? this.hoursInputTarget.value : '',
      subscriptions_open: this.hasSubscriptionsInputTarget ? this.subscriptionsInputTarget.checked : false
    }
  }

  populateForm(activityCard) {
    const hiddenInputs = activityCard.querySelectorAll('input')
    
    hiddenInputs.forEach(input => {
      const name = input.getAttribute('name')
      if (name) {
        const fieldName = name.match(/\[(\w+)\]$/)?.[1]
        if (fieldName) {
          const targetName = `${fieldName}InputTarget`
          const target = this[targetName]
          
          if (target) {
            if (input.type === 'checkbox') {
              target.checked = input.checked
            } else {
              target.value = input.value
            }
          }
        }
      }
    })
  }

  // Atualize também o método setFieldError:
  setFieldError(field, message) {
    console.log("Campo inválido:", field, message)
    if (!field) return
    
    field.classList.add('is-invalid')
    
    // Procurar por invalid-feedback existente
    let feedback = field.parentNode.querySelector('.invalid-feedback')
    
    // Se não existir, criar um
    if (!feedback) {
      feedback = document.createElement('div')
      feedback.className = 'invalid-feedback'
      field.parentNode.appendChild(feedback)
    }
    console.log("Erro de validação:", message)
    feedback.textContent = message
    feedback.style.display = 'block'
  }

  validateDateTime(event) {
    if (!this.hasStartInputTarget || !this.hasEndInputTarget) return
    
    const startTime = this.startInputTarget.value
    const endTime = this.endInputTarget.value
    
    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      if (end <= start) {
        this.setFieldError(this.endInputTarget, 'Horário de término deve ser posterior ao início')
      } else {
        this.endInputTarget.classList.remove('is-invalid')
      }
    }
  }

  createActivityCardHTML(data, index) {
    const speakerInfo = data.speaker ?
      `<span class="me-3"><i class="bi bi-person"></i>${data.speaker}</span>` : ''
    const localInfo = data.local ?
      `<span class="me-3"><i class="bi bi-geo"></i>${data.local}</span>` : ''

    const timeInfo = data.period_start ?
      `<span class="me-3"><i class="bi bi-clock-fill"></i>${this.formatDateTime(data.period_start)} - ${this.formatTime(data.period_end)}</span>` : ''
    const certificateBadge = (data.certificate_hours && parseFloat(data.certificate_hours) > 0) ? 
      `<span class="badge bg-success"><i class="bi bi-file-earmark-text me-2"></i>${data.certificate_hours}h</span>` : ''

    const subscriptionsBadge = data.subscriptions_open ? 
      `<span class="badge bg-info ms-2"><i class="bi bi-person-add"></i>Inscrições abertas</span>` : ''

    return `
      <div class="card mb-3 activity-card" data-activities-target="activity" data-index="${index}">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="d-flex align-items-start">
                <div class="activity-number me-3">
                  <span class="badge bg-primary rounded-circle p-2" style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                    ${index + 1}
                  </span>
                </div>
                
                <div class="flex-grow-1">
                  <h5 class="card-title mb-1">
                    ${data.name}
                    ${data.title ? `<small class="text-muted d-block">${data.title}</small>` : ''}
                  </h5>
                  
                  <div class="text-muted small mb-2">
                    ${speakerInfo}${localInfo}
                  </div>
                  
                  <div class="d-flex align-items-center text-muted small">
                    ${timeInfo}${certificateBadge}${subscriptionsBadge}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-4 text-end">
              <div class="btn-group" role="group">
                <button type="button" 
                        class="btn btn-outline-primary btn-sm"
                        data-bs-toggle="modal" 
                        data-bs-target="#activityModal"
                        data-action="click->activities#editActivity"
                        data-index="${index}">
                  <i class="bi bi-pencil me-1"></i>
                  Editar
                </button>
                
                <button type="button" 
                        class="btn btn-outline-danger btn-sm"
                        data-action="click->activities#removeActivity"
                        data-index="${index}">
                  <i class="bi bi-trash me-2"></i>
                </button>
              </div>
            </div>
          </div>

          <div style="display: none;">
            <input type="text" name="activities[${index}][name]" value="${data.name}">
            <input type="text" name="activities[${index}][title]" value="${data.title || ''}">
            <input type="text" name="activities[${index}][speaker]" value="${data.speaker || ''}">
            <input type="text" name="activities[${index}][local]" value="${data.local || ''}">
            <input type="datetime-local" name="activities[${index}][period_start]" value="${data.period_start || ''}">
            <input type="datetime-local" name="activities[${index}][period_end]" value="${data.period_end || ''}">
            <input type="number" name="activities[${index}][certificate_hours]" value="${data.certificate_hours || ''}">
            <input type="checkbox" name="activities[${index}][subscriptions_open]" value="true" ${data.subscriptions_open ? 'checked' : ''}>
          </div>
        </div>
      </div>
    `
  }

  reindexActivities() {
    this.activityTargets.forEach((activity, index) => {
      // Atualizar número da atividade
      const badge = activity.querySelector('.badge')
      if (badge) badge.textContent = index + 1
      
      // Atualizar data-index
      activity.dataset.index = index
      
      // Atualizar buttons
      const buttons = activity.querySelectorAll('[data-index]')
      buttons.forEach(btn => btn.dataset.index = index)
      
      // Atualizar inputs hidden
      const inputs = activity.querySelectorAll('input')
      inputs.forEach(input => {
        const name = input.getAttribute('name')
        if (name && name.includes('activities[')) {
          input.setAttribute('name', name.replace(/activities\[\d+\]/, `activities[${index}]`))
        }
      })
    })
    
    this.countValue = this.activityTargets.length
  }

  updateCounter() {
    if (this.hasCounterTarget) {
      this.counterTarget.textContent = this.countValue
    }
  }

  toggleEmptyState() {
    if (this.hasEmptyStateTarget) {
      this.emptyStateTarget.style.display = this.countValue === 0 ? 'block' : 'none'
    }
  }

  formatDateTime(dateTimeString) {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  formatTime(dateTimeString) {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div')
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
    alertDiv.innerHTML = `
      <strong>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}</strong>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
    
    document.body.appendChild(alertDiv)
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove()
      }
    }, 4000)
  }
}
