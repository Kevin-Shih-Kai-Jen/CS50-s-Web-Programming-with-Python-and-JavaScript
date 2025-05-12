from django.contrib import admin

# Register your models here.
from .models import CreateListing, User, Bidding, WatchList

admin.site.register(CreateListing)
admin.site.register(User)
admin.site.register(Bidding)
admin.site.register(WatchList)