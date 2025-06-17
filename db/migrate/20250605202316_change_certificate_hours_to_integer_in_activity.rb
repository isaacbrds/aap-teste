class ChangeCertificateHoursToIntegerInActivity < ActiveRecord::Migration[7.2]
  def up
    # Primeiro, limpa dados inválidos
    Activity.where(certificate_hours: [nil, '', 'N/A']).update_all(certificate_hours: '0')
    
    # Depois converte
    change_column :activities, :certificate_hours, :integer, using: 'certificate_hours::integer'
  end
  
  def down
    change_column :activities, :certificate_hours, :string
  end
end
