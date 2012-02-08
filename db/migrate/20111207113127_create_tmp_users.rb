class CreateTmpUsers < ActiveRecord::Migration
  def self.up
    create_table :tmp_users do |t|
      t.string :cnname
      t.integer :workno
      t.string :email
      t.string :phone
      t.string :dept
      t.string :py
      t.string :duty

      #t.timestamps
    end
  end

  def self.down
    drop_table :tmp_users
  end
end
