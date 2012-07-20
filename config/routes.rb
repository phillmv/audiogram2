Audiogram::Application.routes.draw do
  root :to => "feed#index"
  match "/feed" => "feed#feed"
  match "/moar" => 'feed#moar'
  match '/tagged' => 'feed#tagged'
end
