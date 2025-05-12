from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("emails", views.compose, name="compose"),
    path("emails/<int:email_id>", views.email, name="email"),
    path("emails/<str:mailbox>", views.mailbox, name="mailbox"),
    
    # Self_built
    path("get_user_email", views.get_user_email, name="get_user_email"),
    path("email_sent_to_you", views.email_sent_to_you, name="email_sent_to_you"),
    path("email_details", views.email_details, name="email_details"),
    path("archived_email", views.archived_email, name="archived_email")
]
