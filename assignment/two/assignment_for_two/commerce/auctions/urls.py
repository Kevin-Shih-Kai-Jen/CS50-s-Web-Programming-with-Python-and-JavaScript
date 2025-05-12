from django.urls import path

from . import views

urlpatterns = [
    path("", views.active_listings, name="create_listing"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("create_listing/", views.create_listing, name="create_listing"),
    path("active_listings/", views.active_listings, name="active_listings"),
    path("watch_list/<int:item_id>", views.watch_list, name="watch_list"),
    path("item_details/<int:item_id>/", views.item_details, name="item_details"),
    path("categories/", views.categories, name="categories"),
    path("categories_page/<str:category>", views.categories_page, name="categories_page"),
    path("remove_watchlist/<int:item_id>/", views.remove_watchlist, name="remove_watchlist"),
    path("user_created_item/<int:item_id>/", views.user_created_item, name="user_created_item")
]
