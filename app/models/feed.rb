class Feed < ActiveRecord::Base
  # attr_accessible :title, :body
  IMG_COUNT = 40
#  DEFAULT_TAGS = ["paris", "edbanger", "justice", "daftpunk", "uffie", "gainsbourg", "air", "m83", "kavinsky", "yelle", "cassius", "sebastiAn", "busyp", "oizo"]
  #DEFAULT_TAGS = ["japan", "tokyo", "samurai", "sushi", "sword", "geisha", "bladerunner", "katana", "robot", "kurosawa", "manga"]
  
  DEFAULT_TAGS = [ "naturephotography", "musicphotography", "travelphotography", "extremesports", "jazzmusician", "opera", "cottagelife", "documentary"]

  #SEARCH_TAGS = ["thronejs", "tojs", "throneofjs"]
  SEARCH_TAGS = [ "blueant", "blueantmedia", "bam" ]

  CALLBACK_URL = "http://localhost:4567/oauth/callback"

  ACCESS_TOKEN = "229814.9b4ac62.277dd0a52a054ec49e4746a1e1a36d7f"
  Instagram.configure do |config|
    #config.client_id = "9b4ac6296f9a440588de3fc63c3063e1"
    config.client_id = "822b668bc4ec470b9dc0c31cefcd9119"
    #config.client_secret = "1bca67c52d9345db8573927f45b92aa6"
    config.client_secret = "6326d6a8ead244d9ba6ff1df1fa5b6e6"
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
