// managers/tab_navigation_manager.js
export class TabNavigationManager {
  constructor(controller) {
    this.controller = controller
    this.utils = controller.utils
    console.log("TabNavigationManager inicializado")
  }

  // ===== NAVEGAÇÃO PRINCIPAL =====
  
  switchTab(event) {
    const targetTab = event.currentTarget.dataset.tab
    this.showTab(targetTab)
  }

  showTab(tabName) {
    this.utils.log(`Mudando para tab: ${tabName}`)
    const targetsMap = this.controller.getTargetsMap()
    

    // Atualiza botões das tabs
    try {
      const tabButtons = targetsMap.tabButton || []
      ;(tabButtons || []).forEach(button => {
        const isActive = button.dataset.tab === tabName
        button.classList.toggle("active", isActive)
      })
    } catch (err) {
      console.error("[TabNavigationManager] Erro ao atualizar tabButtons:", err)
    }

    // Atualiza conteúdo das tabs
    try {
      const tabContents = targetsMap.tabContent || []
      ;(tabContents || []).forEach(content => {
        const isActive = content.dataset.tab === tabName
        content.classList.toggle("show", isActive)
        content.classList.toggle("active", isActive)
      })
    } catch (err) {
      console.error("[TabNavigationManager] Erro ao atualizar tabContents:", err)
    }

    // Atualiza estado do controller
    this.controller.currentTab = tabName

    // Ações específicas por tab
    if (tabName === "agenda") {
      if (typeof this.controller.renderActivitiesList === "function") {
        this.controller.renderActivitiesList()
      }
    }

    if (tabName === "publicar") {
      this.controller.updateEventSummary()
    }
  }

  // ===== NAVEGAÇÃO SEQUENCIAL =====
  
  saveAndNextTab() {
    if (this.controller.currentTab === "basico") {
      this.controller.saveEventData()
      this.showTab("agenda")
    } else if (this.controller.currentTab === "agenda") {
      this.showTab("ingressos")
    } else if (this.controller.currentTab === "ingressos") {
      this.showTab("publicar")
    }
  }

  previousTab() {
    if (this.controller.currentTab === "agenda") {
      this.showTab("basico")
    } else if (this.controller.currentTab === "ingressos") {
      this.showTab("agenda")
    } else if (this.controller.currentTab === "publicar") {
      this.showTab("ingressos")
    }
  }

  // ===== NAVEGAÇÃO DIRETA =====
  
  goToTab(tabName) {
    return this.showTab(tabName)
  }

  goToFirstTab() {
    return this.showTab(this.getTabOrder()[0])
  }

  goToLastTab() {
    const tabs = this.getTabOrder()
    return this.showTab(tabs[tabs.length - 1])
  }

  // ===== VALIDAÇÃO E CONTROLE =====
  
  canNavigateToTab(tabName) {
    // Implementa lógica de validação se pode navegar para a tab
    const currentTab = this.controller.getState().currentTab
    const tabOrder = this.getTabOrder()
    const currentIndex = tabOrder.indexOf(currentTab)
    const targetIndex = tabOrder.indexOf(tabName)

    // Por enquanto permite navegação livre
    // Futuramente pode implementar validações mais rígidas
    return true
  }

  validateTabTransition(fromTab, toTab) {
    // Valida se pode fazer a transição entre tabs
    switch(fromTab) {
      case 'basico':
        return this.validateBasicTab()
      case 'agenda':
        return this.validateAgendaTab()
      case 'ingressos':
        return this.validateTicketsTab()
      default:
        return true
    }
  }

  // ===== MÉTODOS PRIVADOS =====
  
  updateTabButtons(activeTab) {
    const tabButtons = this.controller.targets.tabButton
    
    tabButtons.forEach(button => {
      const isActive = button.dataset.tab === activeTab
      button.classList.toggle("active", isActive)
      
      // Adiciona estados visuais
      if (isActive) {
        button.setAttribute('aria-selected', 'true')
      } else {
        button.setAttribute('aria-selected', 'false')
      }
    })
  }

  updateTabContent(activeTab) {
    const tabContents = this.controller.targets.tabContent
    
    tabContents.forEach(content => {
      const isActive = content.dataset.tab === activeTab
      content.classList.toggle("show", isActive)
      content.classList.toggle("active", isActive)
      
      // Acessibilidade
      if (isActive) {
        content.setAttribute('aria-hidden', 'false')
        content.removeAttribute('tabindex')
      } else {
        content.setAttribute('aria-hidden', 'true')
        content.setAttribute('tabindex', '-1')
      }
    })
  }

  executeTabActions(tabName) {
    switch(tabName) {
      case "agenda":
        this.controller.renderActivitiesList()
        break
      case "publicar":
        this.controller.updateEventSummary()
        break
      default:
        // Nenhuma ação específica
        break
    }
  }

  saveCurrentTabData(tabName) {
    switch(tabName) {
      case "basico":
        this.controller.saveEventData()
        return true
      case "agenda":
        // Dados das atividades já são salvos automaticamente
        return true
      case "ingressos":
        // TODO: Implementar salvamento de ingressos
        return true
      default:
        return true
    }
  }

  // // ===== CONFIGURAÇÃO E ORDEM =====
  
  // getTabOrder() {
  //   return ["basico", "agenda", "ingressos", "publicar"]
  // }

  // getNextTab(currentTab) {
  //   const tabs = this.getTabOrder()
  //   const currentIndex = tabs.indexOf(currentTab)
    
  //   if (currentIndex === -1 || currentIndex === tabs.length - 1) {
  //     return null
  //   }
    
  //   return tabs[currentIndex + 1]
  // }

  // getPreviousTab(currentTab) {
  //   const tabs = this.getTabOrder()
  //   const currentIndex = tabs.indexOf(currentTab)
    
  //   if (currentIndex <= 0) {
  //     return null
  //   }
    
  //   return tabs[currentIndex - 1]
  // }

  // isValidTab(tabName) {
  //   return this.getTabOrder().includes(tabName)
  // }

  // getCurrentTabIndex() {
  //   const currentTab = this.controller.getState().currentTab
  //   return this.getTabOrder().indexOf(currentTab)
  // }

  // getTabProgress() {
  //   const currentIndex = this.getCurrentTabIndex()
  //   const totalTabs = this.getTabOrder().length
  //   return Math.round(((currentIndex + 1) / totalTabs) * 100)
  // }

  // // ===== VALIDAÇÕES ESPECÍFICAS =====
  
  // validateBasicTab() {
  //   // Valida se os dados básicos estão preenchidos
  //   const eventData = this.controller.getEventData()
  //   const requiredFields = ['name', 'email', 'responsable', 'local']
    
  //   return requiredFields.every(field => 
  //     this.utils.validateRequired(eventData[field])
  //   )
  // }

  // validateAgendaTab() {
  //   // Valida se tem pelo menos uma atividade
  //   const activities = this.controller.getActivities()
  //   return activities && activities.length > 0
  // }

  // validateTicketsTab() {
  //   // Por enquanto sempre válido
  //   // TODO: Implementar validação de ingressos
  //   return true
  // }

  // // ===== MÉTODOS UTILITÁRIOS =====
  
  // getTabInfo(tabName) {
  //   const tabOrder = this.getTabOrder()
  //   const index = tabOrder.indexOf(tabName)
    
  //   return {
  //     name: tabName,
  //     index: index,
  //     isFirst: index === 0,
  //     isLast: index === tabOrder.length - 1,
  //     isValid: index !== -1,
  //     progress: Math.round(((index + 1) / tabOrder.length) * 100)
  //   }
  // }

  // getTabsStatus() {
  //   return this.getTabOrder().map(tabName => ({
  //     name: tabName,
  //     isValid: this.validateTabTransition(tabName, tabName),
  //     isCurrent: tabName === this.controller.getState().currentTab,
  //     info: this.getTabInfo(tabName)
  //   }))
  // }

  // // ===== EVENTOS E CALLBACKS =====
  
  // onTabChange(callback) {
  //   // Permite registrar callbacks para mudanças de tab
  //   if (!this.tabChangeCallbacks) {
  //     this.tabChangeCallbacks = []
  //   }
  //   this.tabChangeCallbacks.push(callback)
  // }

  // triggerTabChangeCallbacks(fromTab, toTab) {
  //   if (this.tabChangeCallbacks) {
  //     this.tabChangeCallbacks.forEach(callback => {
  //       try {
  //         callback(fromTab, toTab)
  //       } catch (error) {
  //         this.utils.logError("Erro em callback de mudança de tab", error)
  //       }
  //     })
  //   }
  // }

  // // ===== MÉTODOS DE DEBUG =====
  
  // debugTabState() {
  //   const state = this.controller.getState()
  //   const tabsStatus = this.getTabsStatus()
    
  //   console.log("=== DEBUG TAB NAVIGATION ===")
  //   console.log("Current tab:", state.currentTab)
  //   console.log("Tab progress:", this.getTabProgress() + "%")
  //   console.log("Tabs status:", tabsStatus)
  //   console.log("=== END DEBUG ===")
  // }

  // // ===== ACESSIBILIDADE =====
  
  // setupKeyboardNavigation() {
  //   // Implementa navegação por teclado
  //   document.addEventListener('keydown', (event) => {
  //     if (event.ctrlKey || event.metaKey) {
  //       switch(event.key) {
  //         case 'ArrowLeft':
  //           event.preventDefault()
  //           this.previousTab()
  //           break
  //         case 'ArrowRight':
  //           event.preventDefault()
  //           this.saveAndNextTab()
  //           break
  //       }
  //     }
  //   })
  // }

  // updateAriaLabels() {
  //   const currentTab = this.controller.getState().currentTab
  //   const tabInfo = this.getTabInfo(currentTab)
    
  //   // Atualiza labels de acessibilidade
  //   this.controller.targets.tabButton.forEach(button => {
  //     const tabName = button.dataset.tab
  //     const info = this.getTabInfo(tabName)
  //     button.setAttribute('aria-label', 
  //       `${tabName} (${info.index + 1} de ${this.getTabOrder().length})`
  //     )
  //   })
  // }
}
