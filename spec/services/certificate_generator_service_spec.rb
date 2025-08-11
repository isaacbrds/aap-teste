# spec/services/certificate_generator_service_spec.rb

require 'rails_helper'
# Requer a gem para ler o conteúdo de PDFs nos testes de integração.
require 'pdf/reader'

RSpec.describe CertificateGeneratorService do
  # --- Setup de Dados Base ---
  # Estes dados são a base para todos os testes, criados uma vez por teste.
  let(:user) { create(:user, email: 'aluno.vitorioso@example.com') }
  let(:event) { create(:event, name: 'Evento da Conquista Final', responsable: 'O Mentor') }
  let!(:certificate) { create(:certificate, user: user, event: event, hours: 42, certificate_number: '2025-FINAL-001') }

  # =========================================================================
  #  SUÍTE 1: TESTES DE INTEGRAÇÃO (VERIFICA O RESULTADO REAL)
  # =========================================================================
  describe 'Geração do PDF (Teste de Integração)' do
    it 'inclui o cabeçalho, conteúdo principal e rodapé corretamente' do
      # --- Execução ---
      service = described_class.new(certificate)
      prawn_document = service.generate_pdf
      
      # --- Análise ---
      reader = PDF::Reader.new(StringIO.new(prawn_document.render))
      # Normaliza múltiplos espaços para um só para facilitar a busca no texto.
      page_text = reader.pages.first.text.gsub(/\s+/, ' ') 

      # --- Verificação do Conteúdo ---
      expect(page_text).to include('CERTIFICADO')
      expect(page_text).to include(user.email)
      expect(page_text).to include("participou do evento #{event.name}")
      expect(page_text).to include("carga horária total de #{certificate.hours} horas")
      expect(page_text).to include("Certificado nº: #{certificate.certificate_number}")
      expect(page_text).to include(event.responsable)
    end

    context 'para a tabela de atividades' do
      it 'inclui os dados da atividade quando ela existe' do
        # --- Setup dos Dados Fonte ---
        activity = create(:activity, event: event, title: "Palestra de Teste de Integração", name: "Palestra de Teste de Integração", speaker: "O Verificador Final", certificate_hours: 8, local: "Online", period_start: event.period_start, period_end: event.period_end)
        create(:activity_registration, user: user, activity: activity, status: 'confirmed')

        # --- Execução ---
        service = described_class.new(certificate.reload)
        prawn_document = service.generate_pdf

        # --- Análise ---
        reader = PDF::Reader.new(StringIO.new(prawn_document.render))
        page_text = reader.pages.first.text

        # --- Verificação ---
        expect(page_text).to include("Atividades participadas:")
        expect(page_text).to include("Palestra de Teste de Integração")
        expect(page_text).to include("O Verificador Final")
        expect(page_text).to include("8h")
      end

      it 'não inclui a seção de atividades quando não existem' do
        # --- Execução ---
        service = described_class.new(certificate)
        prawn_document = service.generate_pdf

        # --- Análise ---
        reader = PDF::Reader.new(StringIO.new(prawn_document.render))
        page_text = reader.pages.first.text

        # --- Verificação ---
        expect(page_text).not_to include("Atividades participadas:")
      end
    end
  end


  # =========================================================================
  #  SUÍTE 2: TESTES DE UNIDADE (VERIFICA COMPORTAMENTOS ESPECÍFICOS)
  # =========================================================================
  describe 'Comportamento Interno (Teste de Unidade com Mocks)' do
    let(:pdf_double) { double("Prawn::Document") }
    let(:banner_double) { double("ActiveStorage::Attached::One") }

    before do
      # Para esta suíte, mockamos o Prawn e o Active Storage para testar intenções.
      allow(Prawn::Document).to receive(:new).and_yield(pdf_double)
      allow(event).to receive(:banner).and_return(banner_double)

      # Ensinamos o dublê do Prawn a responder a todos os métodos necessários.
      allow(pdf_double).to receive_messages(
        move_down: true, font_size: true, text: true, span: true, table: true,
        stroke_color: true, stroke_rectangle: true, image: true,
        # CORREÇÃO FINAL: O dublê `bounds` agora responde a `height` e `width`.
        bounds: double("Prawn::BoundingBox", height: 595, width: 742)
      )
      
      # CORREÇÃO FINAL: O dublê `transparent` agora aceita o bloco.
      allow(pdf_double).to receive(:transparent).with(any_args).and_yield
    end
    
    context 'para a imagem de fundo' do
      it 'tenta adicionar uma imagem se o banner do evento existir' do
        # --- Setup ---
        # Ensinamos o dublê do banner a responder a todas as chamadas do serviço.
        allow(banner_double).to receive_messages(
          attached?: true,
          key: 'uma/chave/fake.jpg'
        )
        allow(banner_double).to receive_message_chain(:blob, :service, :path_for).and_return('caminho/real/fake/para/imagem.jpg')

        # --- Verificação ---
        expect(pdf_double).to receive(:image).with('caminho/real/fake/para/imagem.jpg', any_args)

        # --- Execução ---
        described_class.new(certificate).generate_pdf
      end

      it 'não tenta adicionar uma imagem se o banner não estiver anexado' do
        allow(banner_double).to receive(:attached?).and_return(false)

        expect(pdf_double).not_to receive(:image)
        
        described_class.new(certificate).generate_pdf
      end
    end
  end
end