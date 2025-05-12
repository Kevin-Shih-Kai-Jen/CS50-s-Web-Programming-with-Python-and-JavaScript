from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required


from . import models

from copy import deepcopy





def index(request):
    return render(request, "auctions/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("active_listings"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("active_listings"))


def register(request):
    user_info = models.User.objects.all()
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        
        if "" in [username, email, password]:
            return render(request, "auctions/register.html", {
                "message": "Please fill in every blanks."
            })
        
        
        if password != confirmation:
                return render(request, "auctions/register.html", {
                    "message": "Passwords must match."
                })
        
        for data in user_info:  
            if username in data.username and email in data.email:
                return render(request, "auctions/register.html", {
                    "message": "Username and email have been taken"
                })
            
            if username in data.username:
                return render(request, "auctions/register.html", {
                    "message": "Username has been taken"
                })
            
            if email in data.email:
                return render(request, "auctions/register.html", {
                    "message": "Email has been taken"
                })
            
        # Attempt to create new user
        try:
            name = "register"
            user = models.User.objects.create_user(username, email, password)
            user.save()
            
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Errors occurred, might derive from taken name or email"
            })
            
        login(request, user)
        return HttpResponseRedirect(reverse("active_listings"))
    else:
        return render(request, "auctions/register.html")


def store_value(*args):
    name = args[-1]
    length = len(args)
    
    if name == "watch_list":
        user_watchlist, user, name = args
        item = models.WatchList(user_watchlist=user_watchlist, user=user)
        
        
    if name == "create_listing":
        title, description, starting_bid, category, image, list_builder, name = args
        item = models.CreateListing(title=title, description=description, starting_bid=starting_bid,
                            category=category, image=image, list_builder=list_builder)
        
    
    if name == "bidding":
        bidding_price, bidding_person, bidding_times, bidding_item, name = args
        item = models.Bidding(bidding_price=bidding_price, bidding_person=bidding_person, 
                       bidding_times=bidding_times, bidding_item=bidding_item)
        
    if name == "comments":
        commented_user, commented_item, comments, name = args
        item = models.Comment(commented_user=commented_user, commented_item=commented_item, comments=comments)
        
    item.save()
    
    
@login_required(login_url='auctions/index', redirect_field_name='create_listing')    
def create_listing(request):
    user_id = request.user.id
    
    if request.method == "POST":
        title = request.POST["title"]
        description = request.POST["description"]
        starting_bid = request.POST["starting_bid"]
        category = request.POST["category"]
        image = request.FILES["image"]
        list_builder = get_object_or_404(models.User, id=user_id)
        
        name = "create_listing"
        store_value(title, description, starting_bid, category, image, list_builder, name)
        return HttpResponseRedirect(reverse("active_listings"))
    
    form = models.CreateListingForm()
    return render(request, "auctions/create_listing.html",{
        "form": form
    })



def active_listings(request):
    items = models.CreateListing.objects.all()
        
    return render(request, "auctions/index.html", {
        "items": items
    })

@login_required(login_url='auctions/index', redirect_field_name='create_listing')
def watch_list(request, item_id=0):
    
    if request.method == "POST":
        user = get_object_or_404(models.User, username=request.user.username)
        item = get_object_or_404(models.CreateListing, pk=item_id)
        added_item = models.WatchList.objects.filter(user=request.user)
        
        if added_item.filter(user_watchlist=item).exists():
            return item_details(request, item_id, "This item had already been added to Watch List")
        
        name = "watch_list"
        store_value(item, user, name)
        return redirect(reverse("watch_list", args=[item.id]))

    watchlist = models.WatchList.objects.filter(user=request.user)
    return render(request, "auctions/watch_list.html", {
        "watchlist": watchlist
    })
                
@login_required(login_url='login')
def item_details(request, item_id, error_message: str = None):
    user = get_object_or_404(models.User, username=request.user.username)
    item = get_object_or_404(models.CreateListing, id=item_id)
    commented_item = models.Comment.objects.filter(commented_item=item)
    my_bidding = models.Bidding.objects.filter(bidding_item=item).order_by('-bidding_price').first()

    
    # Make sure the Nonetype of my_bidding won't destroy the html
    if my_bidding:
        price = my_bidding.bidding_price
        times = my_bidding.bidding_times
    
    else:
        price = item.starting_bid
        times = 0
    
    if request.method == "POST":
        ############## bidding ##############
        biddingform = models.BiddingForm(request.POST)
        
        if biddingform.is_valid():
            bidding_price = biddingform.cleaned_data["bidding_price"]
            bidding_times = times + 1
            bidding_person = user
            bidding_item = item
        
        
            if float(bidding_price) > float(price):
                name = "bidding"
                store_value(bidding_price, bidding_person, bidding_times, bidding_item, name)
                return redirect(f"/item_details/{item_id}")
            
            else:
                error_message = "Please bid at a higher price"
        
        
        ############## commenting ##############
        commentform = models.CommentForm(request.POST)
        
        if commentform.is_valid():
            commented_user = user
            commented_item = item
            comments = commentform.cleaned_data["comments"]
            
            name = "comments"
            store_value(commented_user, commented_item, comments, name)
        
            return redirect(f"/item_details/{item_id}")
    
    else:
        biddingform = models.BiddingForm()
        commentform = models.CommentForm()

    
    return render(request, "auctions/item_detail.html",{
        "item": item,
        "biddingform": biddingform,
        "user": user,
        "price": price,
        "times": times,
        "my_bidding": my_bidding,
        "error_message": error_message,
        "comments": commented_item,
        "commentform": commentform
    })


def categories(request):
    items = models.CreateListing.objects.order_by("category")
    item_categories = set(item.category for item in items)
    
    return render(request, "auctions/categories.html", {
        "item_categories": item_categories
    })


def categories_page(request, category):
    items = models.CreateListing.objects.order_by("category")
    required_list = [item for item in items if item.category == category]
    
    return render(request, "auctions/categories_page.html", {
        "required_list": required_list
    }) 
    

def remove_watchlist(request, item_id):
    if request.method == "POST":
        item = get_object_or_404(models.CreateListing, id=item_id)
        user = request.user
        
        models.WatchList.objects.filter(user=user, user_watchlist=item).delete()
        
        return redirect(reverse("watch_list", args=[item_id]))

@login_required(login_url='login')
def user_created_item(request, item_id=0):
    user = request.user
    items = models.CreateListing.objects.filter(list_builder=user)
    
    if request.method == "POST":
        
        "可能因為item被刪掉了，所以就算複製了item.id也可能不見"
        closed_item = get_object_or_404(models.CreateListing, id=item_id)
        bids = models.Bidding.objects.filter(bidding_item=closed_item)
        bidding_user = bids.order_by("-bidding_price").first()
    
        if bids.exists():
            temp_user = bidding_user.bidding_person
        else:
            temp_user = "No one"

        closed_item_dict = [closed_item]  # 用 list 包起來給模板用 for

        closed_item.delete()

        new_items = models.CreateListing.objects.filter(list_builder=user)

        return render(request, "auctions/user_created_item.html", {
            "bidding_user": temp_user,
            "closed_item": closed_item_dict,
            "user": user,
            "items": new_items
        })

    
    
    return render(request, "auctions/user_created_item.html", {
        "user": user,
        "items": items
    })
    