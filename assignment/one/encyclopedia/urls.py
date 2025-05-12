from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<str:name>", views.name_for_entry, name="name_for_entry"),
    path("search/", views.search_bar, name="search_query"),
    path("create_page/", views.create_new_page, name="create_new_page"),
    path("edit_page/", views.edit_page, name="edit_page"),
    path("random_page/", views.random_page, name="random_page")
]

