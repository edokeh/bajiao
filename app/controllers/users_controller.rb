#encoding:utf-8
class UsersController < ApplicationController
  def index
    if %w[onjob quit newbie].include?(params[:type])
      @users = User.send(params[:type])
    else
      @users = User.all
    end

    respond_to do |format|
      format.html # index.html.erb
      format.json do
        render :json=> @users.to_json
      end
    end
  end

  def show
    @user = User.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json do
        render :json => @user.to_json(:only=>[:cnname, :workno, :email, :phone, :dept, :py, :duty, :user_photo_id])
      end
    end
  end

  # 接受脚本上传的JSON数据
  def create
    if params[:secret] == "wocaonima"
      staffs = ActiveSupport::JSON.decode(params[:staffs])
      TmpUser.batch_create(staffs)
      Thread.new do
        User.update_data
        User.update_photo_id
        Version.create(:time=>Time.now)
      end
    end
    render :text=>"update ok!"
  end

end