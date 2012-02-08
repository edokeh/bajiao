class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.string :cnname
      t.integer :workno
      t.string :email
      t.string :phone
      t.string :dept
      t.string :py
      t.string :duty
      t.integer :user_photo_id
      t.boolean :quit, :default=>false
      t.datetime :re_created_at

      t.timestamps
    end
  end

  def self.down
    drop_table :users
  end
end
