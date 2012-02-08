#encoding:utf-8
class TmpUser < ActiveRecord::Base
  #批量创建tmp_user
  def self.batch_create(staffs)
    self.transaction do
      TmpUser.delete_all
      TmpUser.connection.execute("ALTER TABLE tmp_users AUTO_INCREMENT=1")
      #为了效率，组装一个大SQL一次执行
      #time = Time.now.strftime("%Y-%m-%d %H:%M:%S")
      sql_arr = []
      staffs.each do |s|
        sql = []
        %w(cnname workno email phone dept py duty).each do |k|
          sql << s[k]
        end
        #sql << time
        #sql << time
        sql_str = sql.map { |i| i.is_a?(Fixnum) ? i : '"' + i + '"' }.join(",")
        sql_arr << "(" + sql_str + ")"
      end
      TmpUser.connection.execute "INSERT INTO tmp_users(cnname,workno,email,phone,dept,py,duty) values #{sql_arr.join(", ")}"
    end
  end
end
