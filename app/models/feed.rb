class Feed 
  # attr_accessible :title, :body
#  DEFAULT_TAGS = ["paris", "edbanger", "justice", "daftpunk", "uffie", "gainsbourg", "air", "m83", "kavinsky", "yelle", "cassius", "sebastiAn", "busyp", "oizo"]
  #DEFAULT_TAGS = ["japan", "tokyo", "samurai", "sushi", "sword", "geisha", "bladerunner", "katana", "robot", "kurosawa", "manga"]
  
  IMG_COUNT = 40
  CALLBACK_URL = "http://localhost:4567/oauth/callback"

  attr_accessor :next_max, :images
  def initialize(next_max, images)
    @next_max = next_max
    @images = images
  end

  def to_json
    [self.next_max, self.images].to_json
  end

  def self.moar(next_id)
    
    content, images = [], []
    next_max = {}
    Feed::DEFAULT_TAGS.each do |tag|
      if next_id.blank? || next_id[tag].blank?
        tag_media = self.tag_recent_media(tag)
      else
        tag_media = self.tag_recent_media(tag, next_id[tag])
      end
      content << tag_media
      next_max[tag] = tag_media.pagination.next_max_id
    end

    Feed::IMG_COUNT.times do |i|
      content.each do |insta|
        if !insta.data[i].blank?
          images << insta.data[i].images.thumbnail.url
        end
      end
    end

    self.new(next_max, images)
  end
  

  def self.tag_recent_media(tag = nil, max_id = nil)
    if max_id
      Instagram.tag_recent_media(tag, :count => IMG_COUNT, :max_id => max_id)
    else
      Instagram.tag_recent_media(tag, :count => IMG_COUNT)
    end
  end


  def self.tagged
    tag_content = []
    Feed::SEARCH_TAGS.each do |word|
      tag_content << Feed.tag_recent_media(word)
    end
    hsh = {}
    tag_content.each do |content|
      if !content.data.empty?
        content.data.each { |dat| 
          begin
          hsh[dat.created_time] = dat.images.standard_resolution.url 
          rescue Exception => e
          end
        }
      end
    end
    hsh
  end
end
