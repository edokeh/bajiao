class CreateUserPhotos < ActiveRecord::Migration
  def self.up
    create_table :user_photos do |t|
      t.binary :data
      t.string :digest
      t.integer :workno

      t.timestamps
    end
  end

  def self.down
    drop_table :user_photos
  end
end
