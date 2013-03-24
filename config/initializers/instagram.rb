Feed::CLIENT_ID = ENV["CLIENT_ID"] || "822b668bc4ec470b9dc0c31cefcd9119"
Feed::CLIENT_SECRET = ENV["CLIENT_SECRET"] || "822b668bc4ec470b9dc0c31cefcd9119"

default_tags = [ "kissing", 
                 "queer", 
                 "pride",
                 "lgbt",
                 "montreal" ]
search_tags = [ "npnp" ] 

Feed::DEFAULT_TAGS = ENV["DEFAULT_TAGS"] || default_tags
Feed::SEARCH_TAGS = ENV["SEARCH_TAGS"] || search_tags

Instagram.configure do |config|
  config.client_id = Feed::CLIENT_ID
  config.client_secret = Feed::CLIENT_SECRET
end

