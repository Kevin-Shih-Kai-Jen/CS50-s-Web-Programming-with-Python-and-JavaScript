from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ModelForm
from django.utils.timezone import now

from datetime import datetime


class User(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=20)
    
    def __iter__(self):
        return iter((self.username, self.email, self.password))
    
    

class UserForm(ModelForm):
    class Meta:
        model = User
        fields = '__all__'
    
    
class CreateListing(models.Model):  
    title = models.CharField(max_length=30)
    description = models.CharField(max_length=1000)  
    starting_bid = models.DecimalField(max_digits=20, decimal_places=2)
    category = models.CharField(max_length=20)
    image = models.ImageField(upload_to="uploaded_image/", blank=True)
    original_time = models.DateField(auto_now_add=True)
    modifying_time = models.DateField(auto_now=True)     
    list_builder = models.ForeignKey("User", on_delete=models.CASCADE, default="Person doesn't exist", 
                                     to_field="username")
    
    def __iter__(self):
        return iter((self.title, self.description, self.starting_bid, self.category, self.image, self.list_builder))
    
    
class CreateListingForm(ModelForm):
    class Meta:
        model = CreateListing
        fields = ["title", "description", "starting_bid", "category", "image"]
        
        
class Bidding(models.Model):
    bidding_item = models.ForeignKey("CreateListing", on_delete=models.CASCADE, null=True, blank=True)
    bidding_price = models.DecimalField(max_digits=20, decimal_places=2)
    bidding_times = models.IntegerField()
    bidding_person = models.ForeignKey("User", on_delete=models.CASCADE)  # 加上這行！


    def __str__(self):
        return f"{self.bidding_item}, {self.bidding_price}, {self.bidding_times}, {self.bidding_person}"
    
    def __iter__(self):
        return iter((self.bidding_item, self.bidding_price, self.bidding_times, self.bidding_person))

class BiddingForm(ModelForm):
    class Meta:
        model = Bidding
        fields = ["bidding_price"]
        
        
class Comment(models.Model):
    commented_user = models.ForeignKey("User", on_delete=models.CASCADE, null=True, blank=True)
    commented_item = models.ForeignKey("CreateListing", on_delete=models.CASCADE, null=True, blank=True)
    comments = models.TextField(max_length=1200)
    
class CommentForm(ModelForm):
    class Meta:
        model = Comment
        fields = ["comments"]
        
        labels = {
            "comments": (""), # Making the informative text become empty string
        }


class WatchList(models.Model):
    user_watchlist = models.ForeignKey("CreateListing", on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.user}, {self.user_watchlist}"

