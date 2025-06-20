from django.contrib.auth.models import AbstractUser
from django.db import models
from django import forms


class User(AbstractUser):
    photo = models.ImageField(upload_to="profile_pic", blank=True, null=True)
    
    def serialize(self):
        return{
            "profile_photo": [self.photo.url] if self.photo else []
        }

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["photo"]
        widgets = {
            "photo": forms.ClearableFileInput(attrs={
                "class": "profile_photo"
            })
        }
        
class Post(models.Model):
    text = models.TextField(max_length=4000)
    poster = models.ForeignKey(User, on_delete=models.CASCADE)
    photos = models.ImageField(upload_to="uploaded_image/", blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    
    def serialize(self):
        return{
            "id": self.id,
            "text": self.text,
            "poster": self.poster.username,
            "photos": [self.photos.url] if self.photos else [],
            "timestamp": self.timestamp,
            "likes": self.likes
        }
    
class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['text', 'photos']
        widgets={
            "text": forms.Textarea(attrs={
                "id": "post_text",
                "class": "post_text",
                "placeholder": "Type something......"
            }),
            
            "photos": forms.ClearableFileInput(attrs={
                "id": "post_photos",
                "class": "post_photos",
                "placeholder": "Image"
            })
        }
        
class LikePost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    given_like = models.BooleanField(default=False)
    
    def serialize(self):
        return {
            "user": self.user.username,
            "post": self.post.id,
            "giving_like": self.given_like
        }
        
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    comment = models.TextField(max_length=400)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def serialize(self):
        return{
            "user": self.user.username,
            "post": self.post.id,
            "comment": self.comment,
            "timestamp": self.timestamp
        }

class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followed_user")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following", blank=True, null=True)
    
    def serialize(self):
        return{
            "user": self.user,
            "following": self.following,
        }