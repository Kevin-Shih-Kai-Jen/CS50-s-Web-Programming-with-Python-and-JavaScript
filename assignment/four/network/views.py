import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, UserForm, Post, PostForm, LikePost, Comment, Follow

@login_required(login_url="login")
def index(request):
    form = PostForm()
    
    if request.method == "POST":
        text = request.POST["text"]
        poster = request.user
        photos = request.FILES.get("photos")
        
        new_post = Post(text=text, poster=poster, photos=photos)
        new_post.save()

        return HttpResponseRedirect(reverse("index"))
    
    return render(request, "network/index.html", {
        "form":form
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")



def all_post(request, current_page):
    posts = Post.objects.filter().order_by("-timestamp").all()
    paginator = Paginator(posts, 10)
    page_obj = paginator.get_page(current_page)
    
    return JsonResponse({
        "posts": [post.serialize() for post in page_obj],
        "num_pages": paginator.num_pages,
        "current_page": page_obj.number
    })


def user_post(request, current_page, username=None ):
    if username is None:
        user = request.user
    else:
        user = User.objects.get(username=username)
    
    posts = Post.objects.filter(poster=user).order_by("-timestamp").all()
    
    paginator = Paginator(posts, 10)
    page_obj = paginator.get_page(current_page)

    
    return JsonResponse({
        "posts": [post.serialize() for post in page_obj],
        "num_pages": paginator.num_pages,
        "current_page": page_obj.number
    })


def single_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Email doesn't exist"}, status=404)
    
    
    if request.method == "GET":
        return JsonResponse(post.serialize(), safe=False)
    
    
    elif request.method == "POST":
        if request.POST["text"]:
            post.text = request.POST["text"]
        
        if request.FILES["photos"]:
            post.photos = request.FILES["photos"]
        
        post.save()
        
        return JsonResponse({"message": "Post has been uploaded"})
        
    
    if request.method == "PUT":
        #相片用 PUT 很麻煩，暫時先不用
        body = json.loads(request.body)
        
        if body.get("text"):
            post.text = body.get("text")
        
        if body.get("likes"):
            post.likes = body.get("likes")
            
        post.save()
        
        return HttpResponse("Update has been made", status=204)
    
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
        


def giving_like(request, post_id):
    post = Post.objects.get(pk=post_id)
    
    try:
        item, created = LikePost.objects.get_or_create(user=request.user, post=post)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    if request.method == "GET":
        return JsonResponse({"given_like": item.given_like}, safe=False)
    
    elif request.method == "PUT":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid Json"}, status=400)
        
        if body.get("given_like") is not None:
            item.given_like = body["given_like"]
            item.save()
            
            return JsonResponse({
                "message": "The change in given_like has been made"
                }, status=200)
    
    else:
        return JsonResponse({"error": "GET or PUT method are required"})
    
    
def comment(request, post_id):
    post = Post.objects.get(id=post_id)
    
    if request.method == "GET":
        comments = Comment.objects.filter(post=post)
        
        return JsonResponse([comment.serialize() for comment in comments], safe=False)
    
    
    elif request.method == "POST":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid Json"}, status=400)
        
        if body.get("comment") is not None:
            comment = body["comment"]
        
        Comment.objects.create(user=request.user, post=post, comment=comment)
        return JsonResponse({"message": "The comment has been delivered"}, status=200)
    
    
    elif request.method == "PUT":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid Json"}, status=400)
        
        if body.get("comment") is not None:
            comment_item = body["comment"]
        
        commentModel = Comment.objects.get(user=request.user, post=post)
        commentModel.comment = comment_item
        commentModel.save()
        
        return JsonResponse({"message": "The comment has been revised"}, status=200)
        
    else:
        return JsonResponse({"error": "GET or POST or PUT method is required"})
    
    
@login_required(login_url='login')
def profile_page(request):
    # For yourself's profile page
    user = request.user
    
    # 有時候資料會不存在，所以要這樣設值

    following_amount = Follow.objects.filter(user=user).count()
    followed_amount = Follow.objects.filter(following=user).count()

    if request.method == "POST":
        form = UserForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse("profile_page"))  # 避免重送表單
        
    else:
        form = UserForm(instance=user)
        

    return render(request, "network/profile_page.html", {
        "profile_user": user,
        "imageForm": form,
        "following_num": following_amount,
        "followed_num": followed_amount,
        "other_user_profile_page": False
    })


def follow_others(request, username):
    # For other user's profile page
    current_account = request.user
    other_account = User.objects.get(username=username)
    
    followed_amount = Follow.objects.filter(following=other_account).count()
    following_amount = Follow.objects.filter(user=other_account).count()
    
    if request.method == "GET":
        return JsonResponse({"followed_amount": followed_amount,
                             "following_amount":following_amount
                             }, safe=True)
    
    if request.method == "POST":
        body = json.loads(request.body)
        if body.get("followBool") is True:
            item = Follow(user=current_account, following=other_account)
            item.save()
        
        else:
            try:
                item = Follow.objects.get(user=current_account, following=other_account)
                item.delete()
            except Follow.DoesNotExist:
                print("\n\n\n\n\n","Follow item does not exist")
        
        followed_amount = Follow.objects.filter(following=other_account).count()
        following_amount = Follow.objects.filter(user=other_account).count()
        return JsonResponse({"followed_amount": followed_amount, "following_amount": following_amount})

def follow(request):
    # For yourself's profile page
    user = request.user
    
    following_amount = Follow.objects.filter(user=user).count()
    followed_amount = Follow.objects.filter(following=user).count()
    
    if request.method == "GET":
        return JsonResponse({"followed_amount": followed_amount,
                             "following_amount":following_amount
                             }, safe=True)
    
    else:
        return JsonResponse({"error": "GET method is required"})
    
        
def other_people_profile_page(request, username):
    
    # 有時會點到自己的頁面
    if username == request.user.username:
        return profile_page(request)
        
    other_account = User.objects.get(username=username)
    current_account = request.user
    
    following_num = Follow.objects.filter(user=other_account).count()
    followed_num = Follow.objects.filter(following=other_account).count()
    
    try:
        Follow.objects.get(user=current_account, following=other_account)
        whether_current_account_is_following_other_account = True
    except:
        whether_current_account_is_following_other_account = False
        
    if whether_current_account_is_following_other_account:
        follow_button = "Unfollow"
    else:
        follow_button = "Follow"
        
    
    return render(request, "network/profile_page.html", {
        "profile_user": other_account,
        "following_num": following_num,
        "followed_num": followed_num,
        "follow_button": follow_button,
        "other_user_profile_page": True
    })


# This is for clearing wrong settled data while being built when developing
def clearWrongData(request):
    users = User.objects.all()
    
    for user in users:
        follow = Follow.objects.filter(user=user)
        
        for items in follow:
            items.delete()
            print("All wrong data has been cleared")
    
    return None
        


@login_required(login_url="login")
def following_page_api(request, current_page):
    if request.method == "GET":
        user = request.user
        following_users = Follow.objects.filter(user=user)
        post_list = []
        show_list = []
        
        for following_user in following_users:
            posts = Post.objects.filter(poster=following_user.following)
            
            for post in posts:
                post_list.append(post)
                
        start = (current_page - 1) * 10
        end = current_page * 10
        show_list = post_list[start:end]
        
        pages = len(post_list)/10
        if pages > int(pages):
            num_pages = int(pages)+1

        
        return JsonResponse({
            "posts": [post.serialize() for post in show_list],
            "num_pages": num_pages,
            "current_page": current_page
        })
    else:
        return JsonResponse({"error": "GET method is required ha"})

def following_page(request):
    return render(request, 'network/following_page.html')

@login_required
def current_user_data(request):
    return JsonResponse({"username": request.user.username}, safe=False)
    