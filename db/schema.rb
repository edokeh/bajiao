# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20111212090422) do

  create_table "tmp_users", :force => true do |t|
    t.string  "cnname"
    t.integer "workno"
    t.string  "email"
    t.string  "phone"
    t.string  "dept"
    t.string  "py"
    t.string  "duty"
  end

  create_table "user_photos", :force => true do |t|
    t.binary   "data"
    t.string   "digest"
    t.integer  "workno"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "cnname"
    t.integer  "workno"
    t.string   "email"
    t.string   "phone"
    t.string   "dept"
    t.string   "py"
    t.string   "duty"
    t.integer  "user_photo_id"
    t.boolean  "quit",          :default => false
    t.datetime "re_created_at"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "versions", :force => true do |t|
    t.datetime "time"
  end

end
