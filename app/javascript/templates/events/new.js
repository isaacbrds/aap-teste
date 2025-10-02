export default function renderEventsForm(event, csrfToken) {
  return `
    <div data-controller="events">
      <form>
       <div class="container">
        <div class="row mt-4">
          <div class="card">
            <div class="card-header">
              <h3 class="text-center font-weight-light my-4"><i class="bi bi-calendar2-event me-2"></i>Novo Evento</h3>
            </div>
            <div class="card-body">
                <div class="row">
                  <input type="hidden" name="authenticity_token" value="${csrfToken}">
                  <div class="col-12 col-md-6">
                    <label for="event_name">Event Name:</label>
                    <input type="text" id="event_name"  class="form-control" name="event[name]" value="${event.name || ''}" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="event_status">Event Status:</label>
                    <select id="event_status"  class="form-control" name="event[status]">
                      <option value="registrations_open" ${event.status === 'registrations_open' ? 'selected' : ''}>Inscrições Abertas</option>
                      <option value="event_in_progress" ${event.status === 'event_in_progress' ? 'selected' : ''}>Evento em andamento</option>
                      <option value="event_closed" ${event.status === 'event_closed' ? 'selected' : ''}>Evento encerrado</option>
                      <option value="cancelled" ${event.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                  </div>
                  <hr>
                  <span><i class="bi bi-geo-alt me-2 "></i> Data e Local do Evento</span>
                  <div class="col-12 col-md-6 mt-3">
                    <label for="event_period_start">Event Start Date:</label>
                    <input type="date" id="event_period_start"  class="form-control"name="event[period_start]" value="${event.period_start || ''}" />
                  </div>
                  <div class="col-12 col-md-6 mt-3">
                    <label for="event_period_end">Event End Date:</label>
                    <input type="date" id="event_period_end" class="form-control" name="event[period_end]" value="${event.period_end || ''}" />
                  </div>
                  <div class="col-12 col-md-12 mb-3">
                    <label for="event_local">Event Location:</label>
                    <input type="text" id="event_local" class="form-control" name="event[local]" value="${event.local || ''}" />
                  </div>
                  <hr>
                  <span><i class="bi bi-info-circle me-2 "></i> Informações do Evento</span>
                  <div class="col-12 col-md-6 mt-3">
                    <label for="event_email">Event Email:</label>
                    <input type="email" id="event_email"  class="form-control" name="event[email]" value="${event.email || ''}" />
                  </div>

                  <div class="col-12 col-md-6 mt-3">
                    <label for="event_responsable">Event Responsible:</label>
                    <input type="text" id="event_responsable"  class="form-control" name="event[responsable]" value="${event.responsable || ''}" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="event_banner">Event Banner:</label>
                    <input type="file" id="event_banner"  class="form-control" name="event[banner]" accept="image/*" />
                  </div>

                  <div class="col-12 col-md-6 mb-3">
                    <label for="event_comission">Event Comission:</label>
                    <input type="text" id="event_comission"  class="form-control" name="event[comission]" value="${event.comission || ''}" />
                  </div>


                  <div class="col-12 col-md-12 mb-3" >
                    <label for="event_txtEnter">Event Text Enter:</label>
                    <textarea id="event_txtEnter"  class="form-control" name="event[txtEnter]">${event.txtEnter || ''}</textarea>
                  </div>
                  
                  <div class="col-12 col-md-12 mb-3">
                    <label for="event_txtAbout">Event Text About:</label>
                    <textarea id="event_txtAbout"  class="form-control" name="event[txtAbout]">${event.txtAbout || ''}</textarea>
                  </div>
                  <hr>
                  <span><i class="bi bi-gear me-2 "></i> Configurações do HotSite</span>
                  <div class="col-12 col-md-6 mt-3">
                    <label for="event_primaryColor">Primary Color:</label>
                    <input type="color"  class="form-control" id="event_primaryColor" name="event[primaryColor]" value="${event.primaryColor || ''}" />
                  </div>
                  <div class="col-12 col-md-6 mt-3">
                    <label for="event_secondaryColor">Secondary Color:</label>
                    <input type="color" class="form-control" id="event_secondaryColor" name="event[secondaryColor]" value="${event.secondaryColor || ''}" />
                  </div>
                </div>
            </div>
            <div class="card-footer d-flex justify-content-around">
                <button type="submit" data-action="click->events#create">Create Event</button>
                <button type="reset">Reset</button>
                <button type="button" class="btn btn-secondary" onclick="window.history.back()">Cancel</button>
            </div>  
            
          </div>
        </div>
      </form>
    </div>
  `;
}