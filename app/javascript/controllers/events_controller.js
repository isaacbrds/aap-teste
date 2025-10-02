import {Controller} from "@hotwired/stimulus"
import renderEventsForm from "../templates/events/new";
export default class extends Controller {
  connect() {
    this.event = {
      name: "",
      status: "registrations_open",
      period_start: "",
      period_end: "",
      local: "",
      email: "",
      responsable: "",
      banner: "",
      comission: "",
      txtEnter: "",
      txtAbout: "",
      primaryColor: "",
      secondaryColor: ""
    };
  }

  formEvents(event) {
    event.preventDefault();
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    this.element.innerHTML = renderEventsForm(this.event, csrfToken);
  }

  async create(event) {
    event.preventDefault();
    this.event.name = this.element.querySelector("#event_name").value;
    this.event.status = this.element.querySelector("#event_status").value;
    this.event.period_start = this.element.querySelector("#event_period_start").value;
    this.event.period_end = this.element.querySelector("#event_period_end").value;
    this.event.local = this.element.querySelector("#event_local").value;
    this.event.email = this.element.querySelector("#event_email").value;
    this.event.responsable = this.element.querySelector("#event_responsable").value;
    this.event.banner = this.element.querySelector("#event_banner").files[0];
    this.event.comission = this.element.querySelector("#event_comission").value;
    this.event.txtEnter = this.element.querySelector("#event_txtEnter").value;
    this.event.txtAbout = this.element.querySelector("#event_txtAbout").value;
    this.event.primaryColor = this.element.querySelector("#event_primaryColor").value;
    this.event.secondaryColor = this.element.querySelector("#event_secondaryColor").value;
    const authenticity_token = this.element.querySelector("input[name='authenticity_token']").value;
    
    const eventData = {
      event: this.event
    }
    const requestOptions = {
      headers: { 'Accept': 'application/json', 'X-CSRF-Token': authenticity_token, 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify(eventData)
    };

    
    fetch('/admin/events', requestOptions)
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
}