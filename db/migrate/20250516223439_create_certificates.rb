class CreateCertificates < ActiveRecord::Migration[7.2]
  def change
    create_table :certificates do |t|
      t.references :user, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.string :certificate_number
      t.integer :hours, default: 0
      t.datetime :issued_at

      t.timestamps
    end
    add_index :certificates, :certificate_number, unique: true
  end
end
