// app/javascript/controllers/activities_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "template", "activity"]
  static values = { count: Number }

  connect() {
    this.countValue = this.activityTargets.length
  }

  addActivity() {
    const template = this.templateTarget.innerHTML
    const newActivity = template.replace(/__INDEX__/g, this.countValue)
    
    this.containerTarget.insertAdjacentHTML('beforeend', newActivity)
    this.countValue++
    
    // Scroll para a nova atividade
    const newElement = this.containerTarget.lastElementChild
    newElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    // Focus no primeiro campo da nova atividade
    const firstInput = newElement.querySelector('input[type="text"]')
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100)
    }
  }

  removeActivity(event) {
    const activityDiv = event.target.closest('[data-activities-target="activity"]')
    
    if (this.activityTargets.length <= 1) {
      alert('Deve haver pelo menos uma atividade no evento')
      return
    }

    if (confirm('Tem certeza que deseja remover esta atividade?')) {
      activityDiv.style.transition = 'all 0.3s ease'
      activityDiv.style.opacity = '0'
      activityDiv.style.transform = 'translateX(-100%)'
      
      setTimeout(() => {
        activityDiv.remove()
        this.reindexActivities()
      }, 300)
    }
  }

  reindexActivities() {
    this.activityTargets.forEach((activity, index) => {
      // Atualizar todos os names dos inputs
      const inputs = activity.querySelectorAll('input, select, textarea')
      inputs.forEach(input => {
        const name = input.getAttribute('name')
        if (name && name.includes('activities[')) {
          input.setAttribute('name', name.replace(/activities\[\d+\]/, `activities[${index}]`))
        }
      })
      
      // Atualizar o título da atividade
      const title = activity.querySelector('h3')
      if (title) {
        title.textContent = `Atividade ${index + 1}`
      }
    })
    
    this.countValue = this.activityTargets.length
  }

  // Validações em tempo real
  validateDateTime(event) {
    const input = event.target
    const activityDiv = input.closest('[data-activities-target="activity"]')
    const startInput = activityDiv.querySelector('input[name*="[period_start]"]')
    const endInput = activityDiv.querySelector('input[name*="[period_end]"]')
    
    if (startInput.value && endInput.value) {
      const startTime = new Date(startInput.value)
      const endTime = new Date(endInput.value)
      
      if (endTime <= startTime) {
        endInput.setCustomValidity('A data/hora de término deve ser posterior ao início')
        endInput.classList.add('border-red-500')
      } else {
        endInput.setCustomValidity('')
        endInput.classList.remove('border-red-500')
      }
    }
  }
}
