from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile_page", views.profile_page, name="profile_page"),
    path('following_page', views.following_page, name="following_page"),
    
    # API
    path("all_post/<int:current_page>", views.all_post, name="all_post"),
    path("user_post/<int:current_page>", views.user_post, name="user_post"),
    path("user_post/<int:current_page>/<str:username>", views.user_post, name="user_post_username"),
    path("single_post/<int:post_id>", views.single_post, name="single_post"),
    path("giving_like/<int:post_id>", views.giving_like, name="giving_like"),
    path("comment/<int:post_id>", views.comment, name="comment"),
    path("follow", views.follow, name="follow"),
    path("follow_others/<str:username>", views.follow_others, name="follow_others"),
    path("other_people_profile_page/<str:username>", views.other_people_profile_page, name="other_people_profile_page"),
    path("following_page_api/<int:current_page>", views.following_page_api, name="following_page_api"),
    path("current_user_data", views.current_user_data, name="current_user_data"),
]
