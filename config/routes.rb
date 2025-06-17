Rails.application.routes.draw do
  get "home/index"

  devise_for :users

  resources :events, only: %i[ index show ] do
    resources :registrations, only: %i[create destroy]
    resources :activities, only: %i[ index show ] do
      post "register", to: "activity_registrations#register"
    end

    member do
      get :registrations
    end
  end

  namespace :admin do
    resources :users
    resources :events do
      member do
        get :presence_list
      end
      resources :activities, except: [ :index ] do
        member do
          get :activity_presence_list
        end
     end
    end

    root "dashboard#index"
  end

  root "home#index"
end
