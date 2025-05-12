from django.shortcuts import render, redirect
from django.urls import reverse
from .form import NewPage
from . import util, mdConverter
import random


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def name_for_entry(request, name):
    
    content = util.get_entry(name)
    
    if content is None:
        return render(request, "encyclopedia/error.html",{
            "name": name
        })

    else:
        page = mdConverter.converter(
            f"./entries/{name}.md"
            )
        
        request.session["current_title"] = name # for edit_page
        
        return render(request, "encyclopedia/converted_page.html", {
            "title": name,
            "content": page
        })

    

def search_bar(request):
    search_query = request.GET.get("query", "").strip()
    
    if search_query in util.list_entries():
        return redirect("name_for_entry", name=search_query)  # 直接跳轉到該頁面

    # 搜尋關鍵字部分匹配
    substring_outcome = [title for title in util.list_entries() if str(search_query).upper() in str(title).upper()]
    
    if substring_outcome:
        return render(request, "encyclopedia/substring_links.html", {
            "substring_outcome": substring_outcome,
            "search_query": search_query
        })

    # 搜尋不到，轉到錯誤頁面
    return render(request, "encyclopedia/error.html", {"name": search_query})


def create_new_page(request):
    
    if request.method == "POST":
        form = NewPage(request.POST)
        
        if form.is_valid():
            new_title = form.cleaned_data["new_title"]
            new_content = form.cleaned_data["new_content"]
            
            if new_title in util.list_entries():
                return render(request, "encyclopedia/page_already_exist.html", {
                    "title": new_title
                })
            
            else:
                util.save_entry(new_title, new_content)

                return render(request, "encyclopedia/index.html", {
                    "entries": util.list_entries()
                })
            
    else:
        form = NewPage()
        
    return render(request, "encyclopedia/create_new_page.html", {
        "form": form
    })
    

def edit_page(request):
    
    if request.method == "POST":
        new_title = request.POST["altered_title"]
        new_content = request.POST["altered_content"]
        
        util.save_entry(new_title, new_content)
        return redirect("index")

    else:
        name = request.session["current_title"]
    
        original_title = name
        original_content = util.get_entry(name)
        
        return render(request, "encyclopedia/edit_page.html", {
            "title": original_title,
            "content": original_content
        })
    
def random_page(request):
    title = random.choice(util.list_entries())
    
    return name_for_entry(request, title)
    
    