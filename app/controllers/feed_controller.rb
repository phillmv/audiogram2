class FeedController < ApplicationController
  def index
  end

  
  def moar
    feed = Feed.moar(params[:next_id])
    render :inline => feed.to_json
  end

  def tagged

    hsh = Feed.tagged
    if hsh.present?
      render :inline => hsh.to_json
    else
      render :inline => ""
    end

  end

  def hsh(str)
    Digest::MD5.hexdigest(str)
  end

end
