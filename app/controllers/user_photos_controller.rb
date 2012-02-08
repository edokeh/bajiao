#encoding:utf-8
class UserPhotosController < ApplicationController
  def index
    @photos = UserPhoto.all
    
    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @photos.to_json(:only=>[:digest,:workno]) }
    end
  end

  def show
    @photo = UserPhoto.find(params[:id])
    send_data @photo.data, :type => 'image/jpeg'
  end

  def create
    data =  params[:file]
    workno = params[:workno]
    @photo = UserPhoto.where(:workno=>workno).first
    if @photo
      @photo.update_attributes(:data=>data.read)
    else
      UserPhoto.create(:workno=>workno, :data=>data.read)
    end
    render :text=>"ok"
  end

end