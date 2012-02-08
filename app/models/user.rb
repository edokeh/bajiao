#encoding:utf-8
class User < ActiveRecord::Base
  scope :quit, where(:quit=>true)
  scope :onjob, where(:quit=>false)

  #根据tmp_users表更新自己
  def self.update_data
    #处理在职员工的离职或变动情况
    User.onjob.each do |user|
      tmp_user = TmpUser.where(:workno=>user.workno).first
      if tmp_user
        if user.update_by_tmpuser(tmp_user)
          puts  "update user #{user.cnname}"
        end
        tmp_user.delete
      else
        #处理离职
        user.update_attributes(:quit=>true)
        puts "quit user #{user.cnname}"
      end
    end

    #处理离职员工的重修情况
    User.quit.each do |user|
      tmp_user = TmpUser.where(:workno=>user.workno).first
      if tmp_user
        user.update_by_tmpuser(tmp_user)
        user.quit = false
        user.re_created_at = Time.now
        user.save
        tmp_user.delete
        puts "reonjob user #{user.cnname}"
      end
    end

    #处理入职新员工的情况
    TmpUser.all.each do |tmp_user|
      User.create(tmp_user.attributes.except("updated_at", "created_at"))
      tmp_user.delete
      puts "new user #{tmp_user.cnname}"
    end

    return true
  end

  #更新图片的id
  def self.update_photo_id
    User.all.each do |user|
      photo = UserPhoto.where(:workno=>user.workno).first
      if photo
        user.update_attributes(:user_photo_id=>photo.id)
      else
        user.update_attributes(:user_photo_id=>nil)
      end
    end
    return true
  end

  #根据tmp_users的数据更新自己
  def update_by_tmpuser(tmp_user)
    is_same = true
    [:cnname, :workno, :email, :phone, :dept, :py, :duty].each do |f|
      if tmp_user.send(f) != self.send(f)
        is_same = false
        break
      end
    end
    unless is_same
      self.update_attributes(tmp_user.attributes.except("updated_at", "created_at"))
    end
    return !is_same
  end

end
