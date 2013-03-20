class FeedController < ApplicationController
  def index
    # copy file
  end

  # def feed
  #   client = Instagram.client(:access_token => session[:access_token])
  #   user = client.user

  #   html = "<h1>#{user.username}'s recent photos</h1>"
  #   for media_item in client.user_recent_media
  #     html << "<img src='#{media_item.images.thumbnail.url}'>"
  #   end
  #   render :inline => html
  # end

  def moar
    @images = []
    tags = Feed::DEFAULT_TAGS

    content = []

    pagination = params[:next_id]
    next_max_id = {}

    tags.each do |tag|

      if pagination.nil? || pagination[tag].nil? || pagination[tag].empty?
        tag_media = Feed.tag_recent_media(tag)
      else
        tag_media = Feed.tag_recent_media(tag, pagination[tag])
        puts "#{tag} -- #{pagination[tag]}"
      end
      content << tag_media
      next_max_id[tag] = tag_media.pagination.next_max_id
    end

    Feed::IMG_COUNT.times do |i|
      content.each do |insta|
        if !insta.data[i].nil?
          @images << insta.data[i].images.thumbnail.url
        end
      end
    end
    #  end
    render :inline => [next_max_id, @images].to_json
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
