  # This file should ensure the existence of records required to run the application in every environment (production,
  # development, test). The code here should be idempotent so that it can be executed at any point in every environment.
  # The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
  #
  # Example:
  #
  #   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
  #     MovieGenre.find_or_create_by!(name: genre_name)
  #   end

  # db/seeds.rb

  # Criando usuários
  admin = User.create!(
    email: "admin@example.com",
    password: "123456",
    role: "admin"
  )

 # event_owner = User.second
 event_owner = User.create!(
   email: "dono@example.com",
   password: "123456",
   role: "manager"
 )

 participant = User.create!(
   email: "participante@example.com",
   password: "123456",
   role: "registered"
 )

# Criação de 15 eventos com imagem padrão da internet
Event.create!(
  [
    {
      name: "RubyConf 2024",
      local: "São Paulo",
      period_start: Date.today + 30.days,
      period_end: Date.today + 33.days,
      email: "organizador@rubyconf.com",
      responsable: "João Silva",
      txtEnter: "O maior evento de Ruby da América Latina.",
      txtAbout: "Um evento para desenvolvedores Ruby, com palestras, workshops e muito networking.",
      comission: "Comissão RubyConf",
      primaryColor: "#FF5733",
      secondaryColor: "#C70039",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "DevOps Summit",
      local: "Rio de Janeiro",
      period_start: Date.today + 45.days,
      period_end: Date.today + 46.days,
      email: "contato@devopssummit.com",
      responsable: "Maria Fernanda",
      txtEnter: "Tudo sobre DevOps e Automação.",
      txtAbout: "Um evento focado nas práticas de DevOps e automação de infraestrutura.",
      comission: "Comissão DevOps",
      primaryColor: "#28B463",
      secondaryColor: "#239B56",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "AI & Machine Learning Expo",
      local: "Belo Horizonte",
      period_start: Date.today + 60.days,
      period_end: Date.today + 62.days,
      email: "ai@expo.com",
      responsable: "Carlos Andrade",
      txtEnter: "Explorando o futuro da inteligência artificial.",
      txtAbout: "Conferência para discutir os avanços em AI, machine learning e suas aplicações.",
      comission: "Comissão AI Expo",
      primaryColor: "#1F618D",
      secondaryColor: "#5DADE2",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Front-End Masters",
      local: "Curitiba",
      period_start: Date.today + 10.days,
      period_end: Date.today + 12.days,
      email: "frontend@masters.com",
      responsable: "Lucas Andrade",
      txtEnter: "Workshop focado em tecnologias de front-end.",
      txtAbout: "Com foco em React, Angular e Vue.js, este evento traz palestras e workshops práticos.",
      comission: "Comissão Front-End",
      primaryColor: "#FF9900",
      secondaryColor: "#FF5733",
      status: "event_in_progress",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Data Science Meetup",
      local: "Fortaleza",
      period_start: Date.today + 5.days,
      period_end: Date.today + 6.days,
      email: "datascience@meetup.com",
      responsable: "Ana Paula",
      txtEnter: "Tudo sobre Data Science e suas aplicações.",
      txtAbout: "Discussões sobre Python, R, machine learning e big data.",
      comission: "Comissão Data Science",
      primaryColor: "#5D6D7E",
      secondaryColor: "#D5DBDB",
      status: "event_closed",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Blockchain Conference",
      local: "Brasília",
      period_start: Date.today + 20.days,
      period_end: Date.today + 21.days,
      email: "blockchain@conference.com",
      responsable: "Bruno Soares",
      txtEnter: "A revolução do Blockchain.",
      txtAbout: "Uma conferência para desenvolvedores, investidores e entusiastas de blockchain.",
      comission: "Comissão Blockchain",
      primaryColor: "#3498DB",
      secondaryColor: "#2980B9",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "React Native Summit",
      local: "Florianópolis",
      period_start: Date.today + 25.days,
      period_end: Date.today + 26.days,
      email: "rnative@summit.com",
      responsable: "Thiago Martins",
      txtEnter: "O maior evento de React Native.",
      txtAbout: "Workshops e palestras focadas em desenvolvimento mobile com React Native.",
      comission: "Comissão React Native",
      primaryColor: "#2ECC71",
      secondaryColor: "#27AE60",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Angular Connect",
      local: "Porto Alegre",
      period_start: Date.today + 15.days,
      period_end: Date.today + 17.days,
      email: "angular@connect.com",
      responsable: "Roberta Lima",
      txtEnter: "Conecte-se com o mundo do Angular.",
      txtAbout: "Discussões avançadas sobre o futuro do Angular, com experts da área.",
      comission: "Comissão Angular",
      primaryColor: "#E74C3C",
      secondaryColor: "#C0392B",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Python Brasil",
      local: "Salvador",
      period_start: Date.today + 40.days,
      period_end: Date.today + 42.days,
      email: "python@brasil.com",
      responsable: "Carlos Medeiros",
      txtEnter: "O maior evento de Python do Brasil.",
      txtAbout: "Uma conferência com palestras, workshops e hackathons focados em Python.",
      comission: "Comissão Python",
      primaryColor: "#F39C12",
      secondaryColor: "#D35400",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "UX Design Conference",
      local: "Recife",
      period_start: Date.today + 35.days,
      period_end: Date.today + 36.days,
      email: "uxdesign@conference.com",
      responsable: "Juliana Rocha",
      txtEnter: "O futuro do design de experiência do usuário.",
      txtAbout: "Palestras e workshops sobre as melhores práticas em UX Design.",
      comission: "Comissão UX Design",
      primaryColor: "#9B59B6",
      secondaryColor: "#8E44AD",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Cloud Computing Expo",
      local: "Manaus",
      period_start: Date.today + 70.days,
      period_end: Date.today + 72.days,
      email: "cloud@expo.com",
      responsable: "Ricardo Neves",
      txtEnter: "Explorando o futuro da computação em nuvem.",
      txtAbout: "Um evento para discutir as inovações e melhores práticas em cloud computing.",
      comission: "Comissão Cloud Expo",
      primaryColor: "#2980B9",
      secondaryColor: "#3498DB",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Cybersecurity Conference",
      local: "Belém",
      period_start: Date.today + 50.days,
      period_end: Date.today + 52.days,
      email: "cybersecurity@conference.com",
      responsable: "Fernando Ramos",
      txtEnter: "O mundo da cibersegurança.",
      txtAbout: "Palestras sobre ataques, prevenção e o futuro da segurança digital.",
      comission: "Comissão Cybersecurity",
      primaryColor: "#C0392B",
      secondaryColor: "#E74C3C",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Java Spring Boot Camp",
      local: "João Pessoa",
      period_start: Date.today + 55.days,
      period_end: Date.today + 56.days,
      email: "springboot@bootcamp.com",
      responsable: "Leonardo Azevedo",
      txtEnter: "Aprofundando-se no Spring Boot.",
      txtAbout: "Workshops práticos sobre o Spring Boot e suas integrações.",
      comission: "Comissão Spring Boot",
      primaryColor: "#2C3E50",
      secondaryColor: "#34495E",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "IoT Innovations",
      local: "Natal",
      period_start: Date.today + 65.days,
      period_end: Date.today + 66.days,
      email: "iot@innovations.com",
      responsable: "Pedro Alves",
      txtEnter: "Inovações em Internet das Coisas.",
      txtAbout: "Uma conferência voltada para as novas tecnologias em IoT.",
      comission: "Comissão IoT",
      primaryColor: "#1ABC9C",
      secondaryColor: "#16A085",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "IoT Innovations",
      local: "Natal",
      period_start: Date.today + 65.days,
      period_end: Date.today + 66.days,
      email: "iot@innovations.com",
      responsable: "Pedro Alves",
      txtEnter: "Inovações em Internet das Coisas.",
      txtAbout: "Uma conferência voltada para as novas tecnologias em IoT.",
      comission: "Comissão IoT",
      primaryColor: "#1ABC9C",
      secondaryColor: "#16A085",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id
    },
    {
      name: "Tech Talks 2024",
      local: "Vitória",
      period_start: Date.today + 75.days,
      period_end: Date.today + 76.days,
      email: "techtalks@conference.com",
      responsable: "Patrícia Ferreira",
      txtEnter: "Conversas sobre inovação tecnológica.",
      txtAbout: "Palestras curtas e dinâmicas sobre tendências tecnológicas emergentes.",
      comission: "Comissão Tech Talks",
      primaryColor: "#F7DC6F",
      secondaryColor: "#F1C40F",
      status: "registrations_open",
      banner:  File.open(Rails.root.join("public/icon.png")),
      user_id: event_owner.id

    }
  ]
)

Event.all.each do |event|
  # Criando 5 atividades para cada evento
  5.times do |i|
    Activity.create!(
      name: "Atividade #{i + 1} para #{event.name}",
      title: "Explorando Novas Fronteiras #{i + 1}",
      period_start: DateTime.now + [ 1, 2, 3, 4 ].sample.days,
      speaker: [ "Dr. Ana Silva", "Prof. João Souza", "Eng. Carlos Costa", "Maria Oliveira", "Cláudia Pereira" ].sample,
      local: [ "Sala 101", "Auditório Principal", "Laboratório A", "Sala Virtual", "Praça de Eventos" ].sample,
      certificate_hours: "#{[ 1, 2, 3, 4, 5 ].sample} horas",
      subscriptions_open: [ true, false ].sample,
      event: event # Associa a atividade ao evento correspondente
    )
  end
end

# Criando 10 usuários em cada evento cadastrado acima.
Event.all.each do |event|
  10.times do |i|
    participant = User.create(
      email: Faker::Internet.email,
      password: '123456',
      role: "registered"
    )
    # Cada usuário se registra no evento
    Registration.create(user: participant, event: event)
  end
end

# # Criação de atividades para os eventos
# Activity.create!(
#   name: "Palestra sobre IA",
#   title: "Inteligência Artificial: O Futuro",
#   speaker: "Carlos Andrade",
#   period_start: DateTime.now + 5.days,
#   local: "Sala 101",
#   certificate_hours: "2",
#   subscriptions_open: true,
#   event: event1
# )

# Activity.create!(
#   name: "Workshop de Blockchain",
#   title: "Entendendo a Blockchain",
#   speaker: "Fernanda Souza",
#   period_start: DateTime.now + 1.days,
#   local: "Sala 102",
#   certificate_hours: "3",
#   subscriptions_open: true,
#   event: event1
# )

# Activity.create!(
#   name: "Mesa Redonda de Negócios",
#   title: "Desafios do Empreendedorismo",
#   speaker: "Vários",
#   period_start: DateTime.now + 1.days,
#   local: "Sala Principal",
#   certificate_hours: "1",
#   subscriptions_open: true,
#   event: event2
# )

# Activity.create!(
#   name: "Palestra de Marketing Digital",
#   title: "O Futuro do Marketing",
#   speaker: "Ana Clara",
#   period_start: DateTime.now,
#   local: "Sala Secundária",
#   certificate_hours: "2",
#   subscriptions_open: true,
#   event: event2
# )

puts "Seed data loaded successfully!"
