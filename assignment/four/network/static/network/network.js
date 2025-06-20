document.addEventListener("DOMContentLoaded", () => {

    console.log("Now we are successfully operating JS")

    const allPostDiv = document.getElementById("all_post")
    const current_page = window.location.pathname

    sessionStorage.setItem("current_page_name", current_page)

    // 看現在在貼文的第幾頁
    const page = sessionStorage.getItem("current_page")
    if (page === null || page === undefined || page === "undefined" || page === "null") {
        sessionStorage.setItem("current_page", "1")
    }

    // 根據頁面路徑載入對應貼文
    renewPages()

    // 如果一進來就已經接近底部，就載入頁面按鈕
    if (window.innerHeight + window.scrollY + 50 >= document.body.offsetHeight) {
        addPageButton()
    }

    // 因為翻頁按鈕是動態生成，所以改用事件委派
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("next_page_button")) {
            console.log("Next page button is clicked")
            sessionStorage.setItem("current_page", Number(sessionStorage.getItem("current_page")) + 1)
            renewPages()
        } else if (event.target.classList.contains("previous_page_button")) {
            console.log("Previous page button is clicked")
            sessionStorage.setItem("current_page", Number(sessionStorage.getItem("current_page")) - 1)
            renewPages()
        }
    })

    // 處理點擊事件（like, edit, comment button...）
    if (allPostDiv) {

        if (!allPostDiv.hasAttribute("data-bound")) {
            allPostDiv.setAttribute("data-bound", "true")

        allPostDiv.addEventListener("click", event => {
            let clickCount = 0;
            if (event.target.classList.contains("heart_button")) {
                clickCount += 1;
                console.log(`Heart button clicked: ${clickCount} times`);
                console.log("Heart button is clicked")
                console.log("heart button: ", event.target)
                heartButtonBeingClicked(event.target)
            }

            if (event.target.name === "show_comment_button") {
                console.log("The show comment button has been clicked")
                showCommentButtonBeingClicked(event.target)
            }

            if (event.target.className === "edit_button") {
                console.log("Edit button has been clicked")
                EditButtonBeingClicked(event.target)
            }

            if (event.target.classList.contains("edit_submit_button")) {
                console.log("Submit button of editted content has been clicked")
                submitEdittedContent(event.target)
            }
        })

        // 處理留言或編輯表單送出
        allPostDiv.addEventListener("submit", event => {
            if (event.target.tagName === "FORM") {
                event.preventDefault()
                console.log("Comment has been submitted")
                commentBeingSubmitted(event.target)
            }

            if (event.target.classList.contains("edit_form")) {
                event.preventDefault()
                console.log("Edit form submitted")
                submitEdittedContent(event.target)
            }
        }) 
    }

        
        
    }

    // Follow 按鈕點擊
    const followButton = document.getElementById("follow_button")
    if (!followButton.hasAttribute("data-bound")) {
        followButton.setAttribute("data-bound", "true")
        
        if (followButton) {
            followButton.addEventListener("click", (event) => {
                console.log("Follow button has been clicked")
                followButtonBeingClicked(event.target)
            })
        }
    }

    // navbar 點擊事件
    const LinkWords = document.getElementById("all_links")
    console.log("LinkWords: ", LinkWords)

    if (LinkWords) {
        LinkWords.addEventListener("click", (event) => {
            if (event.target.classList.contains("following_page")) {
                console.log("The following post button has been clicked")
                sessionStorage.setItem("current_page", "1")
                console.log("Plz respond")
                followingPageBeingClicked()
            }

            if (event.target.classList.contains("all_post_nav_link")) {
                event.preventDefault()
                sessionStorage.setItem("current_page", "1")
                window.location.href = event.target.href
            }

            if (event.target.classList.contains("profile_page_nav_link")) {
                event.preventDefault()
                sessionStorage.setItem("current_page", "1")
                window.location.href = event.target.href
            }

            if (event.target.classList.contains("logout_link")) {
                event.preventDefault()
                sessionStorage.setItem("current_page", "1")
                window.location.href = event.target.href
            }

            console.log("I am here")
        })
    }

    // 上傳圖片時顯示預覽
    const imgInput = document.querySelector("input[type=file]")
    if (imgInput) {
        imgInput.addEventListener("change", (event) => {
            displayNewPhoto(event.target)
        })
    }

    // 檢查畫面有沒有滑到底部
    document.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            addPageButton()
        }
    })

})


async function allPost(path){
    console.log("Current page from sessionStorage:", sessionStorage.getItem("current_page"))

    const data = await fetch(path)
    const posts = await data.json()

    const totalPages = posts.num_pages
    const currentPage = posts.current_page || 1 

    sessionStorage.setItem("max_pages", totalPages)
    sessionStorage.setItem("current_page", String(currentPage))

    var allPost = document.getElementById("all_post")

    console.log(posts.length)
    allPost.innerHTML = ""

    if(posts.length === 0){
        allPost.innerHTML = `<p> No post yet </p>`
    }else{
        for(let post of posts.posts){
            let postDiv = postBlock(post)
            allPost.appendChild(postDiv)
        }
    }

    return "All posts have been uploaded"

}

function postBlock(post){
    // Insert elements of post in a bigger div
    var postDiv = document.createElement("div")

    let posterDiv = document.createElement("div")
    let textDiv = document.createElement("div")
    let photosDiv = document.createElement("div")
    let timestampDiv = document.createElement("div")
    let heartDiv = document.createElement("div")
    let commentDiv = document.createElement("div")
    let editDiv = document.createElement("div")
    let imageButtonDiv = document.createElement("div")

    postDiv.className = `post`
    postDiv.id = `post_${post.id}`

    posterDiv.className = "post_poster"
    textDiv.className = "post_text"
    photosDiv.className = "post_photos"
    timestampDiv.className = "post_timestamp"
    heartDiv.className = "post_heart"
    commentDiv.className = "post_comment"
    editDiv.className = "post_edit"
    imageButtonDiv.className = "post_imageButton"


    posterDiv.innerHTML = posterProfileLink(post.poster)
    textDiv.innerHTML = post.text
    post.photos.forEach(photoUrl=>{
        photosDiv.appendChild(photo(photoUrl))
    })
    timestampDiv.innerHTML = post.timestamp

    //imageButtonDiv
    heartDiv.appendChild(LikeButtonImage(post.id))
    heartDiv.appendChild(likeNumbers(post.likes))
     
    commentDiv.appendChild(showCommentButton()) 

    //edit button
    editButton(post).then(button => {
        if(button != null){
            editDiv.appendChild(button)
        }
    })

    imageButtonDiv.appendChild(heartDiv)
    imageButtonDiv.appendChild(commentDiv)
    imageButtonDiv.appendChild(editDiv)
    
    let postList = [posterDiv, textDiv, photosDiv, timestampDiv, imageButtonDiv]

    postList.forEach(element =>{
        postDiv.appendChild(element)
    })

    return postDiv



    function photo(photoUrl){
        let img = document.createElement("img")
        img.src = photoUrl
        img.alt = "ahahah fuck you"
        img.classList = "img-thumbnail original_photo"
        

        return img
    }

    function LikeButtonImage(postId){
        var button = document.createElement("button")
        button.type = "button"
        button.classList.add("heart_button")


        fetch(`http://127.0.0.1:8000/giving_like/${postId}`)
        .then(response => response.json())
        .then(like => {
            if(like.given_like){
                button.classList.add("liked")
            }else{
                button.classList.remove("liked")
            }
    })

        return button
    }
}

async function heartButtonBeingClicked(postButton){
    let post = postButton.closest(`.post`)
    let postId = post.id.split("_")[1]
    let like_amount = post.querySelector(".like_amount")
    var like = 0

    if(postButton.classList.contains("liked")){     
        like = -1
        var given_like = false
        console.log("Button classList has been removed liked")
        console.log("heart_button_before: ", postButton)
        postButton.classList.remove("liked")
        console.log("heart_button_after: ", postButton)
    }else{
        like = 1
        var given_like = true
        console.log("Button classList has been added liked")
        console.log("heart_button_before: ", postButton)
        postButton.classList.add("liked")
        console.log("heart_button_after: ", postButton)
    }


    let response = await fetch(`http://127.0.0.1:8000/single_post/${postId}`)
    let singlePost = await response.json()

    singlePost.likes += like
    like_amount.innerHTML = singlePost.likes

    //set csrftoken manually
    //Update current amount of likes
    const csrftoken = getCookie("csrftoken")
    fetch(`http://127.0.0.1:8000/single_post/${postId}`, {
        method:"PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken // Remeber this
        },
        body: JSON.stringify({
            likes: singlePost.likes
        })  
    })
    .then((message)=> console.log("single_post message: ", message))
    

    //Update whether the user likes the post 
    fetch(`http://127.0.0.1:8000/giving_like/${postId}`, {
        method: "PUT",
        headers:{
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        }, 
        body: JSON.stringify({
            given_like: given_like
        })
    })
    .then(message => console.log(message))
}


function likeNumbers(likes){
    let likeDiv = document.createElement("p")
    likeDiv.innerHTML = likes
    likeDiv.className = "like_amount"

    return likeDiv
}


function commentField(){
    let commentForm = document.createElement("form")
    commentForm.className = "comment_form"
    commentForm.method = "POST"

    //csrftoken
    const csrftoken = getCookie("csrftoken")
    const csrftokenInput = document.createElement("input")
    csrftokenInput.type = "hidden"
    csrftokenInput.name = "csrftoken_input"
    csrftokenInput.value = csrftoken

    const commentTextArea = document.createElement("textarea")
    commentTextArea.className = "comment"
    commentTextArea.placeholder = "Comment here"

    //normal submitting comment button
    const commentButton = document.createElement("button")
    commentButton.classList = "button button1 comment_button"
    commentButton.innerText = "Post"
    commentButton.type = "submit"

    commentForm.appendChild(csrftokenInput)
    commentForm.appendChild(commentTextArea)
    commentForm.appendChild(commentButton)

    return commentForm
}


function showCommentButton(){
    //show comment button with picture
    const showCommentButton = document.createElement("button")
    showCommentButton.className = "show_comment_button"
    showCommentButton.name = "show_comment_button"
    showCommentButton.type = "button"

    return showCommentButton
}


function commentBeingSubmitted(comment){
    const commentedPost = comment.closest(".post")
    const postId = commentedPost.id.split("_")[1]

    const csrftoken = getCookie("csrftoken")
    //Because we the event is the form being submitted
    //so the event.target is form, not the value in textarea
    const commentText = comment.querySelector(".comment").value

    fetch(`http://127.0.0.1:8000/comment/${postId}`, {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            "comment": commentText
        })
    })
    .then(message => console.log(message))
    .then(()=>{ 
        commentText.value = ""
        showCommentButtonBeingClicked(commentedPost.querySelector(".show_comment_button"))
    })
}


function showCommentButtonBeingClicked(showCommentButton){
        const post = showCommentButton.closest(".post")
        const postId = post.id.split("_")[1]

        //If the comment has shown before
        //Then clicking again will take back the comments
        if(post.querySelector(".bigCommentDiv")){
            post.querySelector(".bigCommentDiv").remove()
            return;
        }

        fetch(`http://127.0.0.1:8000/comment/${postId}`)
        .then(response=> response.json())
        .then(comments=>{
            let bigCommentDiv = document.createElement("div")
            bigCommentDiv.className = "bigCommentDiv"

            comments.forEach(comment =>{
                bigCommentDiv.appendChild(eachCommentDiv(comment))
            })

            if (post.querySelector(".bigCommentDiv")) {
                post.querySelector(".bigCommentDiv").innerHTML = ""
            }
            
            post.appendChild(bigCommentDiv)
            bigCommentDiv.appendChild(commentField())
            
        })


            
        function eachCommentDiv(comments){
            const smallCommentDiv = document.createElement("div")
            smallCommentDiv.className = "smallCommentDiv"
            console.log(JSON.stringify(comments))
            
            smallCommentDiv.innerHTML = `
            <strong>${comments.user}</strong>: ${comments.comment}
            <br>
            <small>${comments.timestamp}</small>
            `
            
            return smallCommentDiv
        }
}


function posterProfileLink(poster){
    sessionStorage.setItem("whose_user_profile", poster)
    return poster.link(`http://127.0.0.1:8000/other_people_profile_page/${poster}`)
}


function followButtonBeingClicked(button){
        if(button.innerText === "Follow"){
            button.innerText = "Unfollow"
            followBool = true
        }else if(button.innerText === "Unfollow"){
            button.innerText = "Follow"
            followBool = false
        }else{
            console.log("Button innerText is None, problems need to be resolved")
        }

        const currentAPI = window.location.href
        const csrftoken = getCookie("csrftoken")
        const followingUserString = currentAPI.split("/")
        const followingUser = followingUserString[followingUserString.length - 1]
        let followedNumLabel = document.getElementById("followed_num")
        let followedNum = Number(followedNumLabel.innerHTML)
        console.log(followedNum)
        console.log(followBool)

        fetch(`http://127.0.0.1:8000/follow_others/${followingUser}`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({
                "followBool": followBool
            })
        })
        .then(console.log("Follow data has been updated"))
        .then(response => response.json())
        .then(data => {
            followedNumLabel.innerHTML = ""
            followedNumLabel.innerHTML = data.followed_amount
        })
}


function followingPageBeingClicked(){
    currentPage = sessionStorage.getItem("current_page")
    allPost(`/following_page_api/${currentPage}`).then(message =>{
        console.log(message)})
    return link("http://127.0.0.1:8000/following_page")
}


async function editButton(post){

    var button = document.createElement("button")
    
    //Get the data of current user
    const response = await fetch("http://127.0.0.1:8000/current_user_data")
    const data = await response.json()

    if(post.poster === data.username){   
        console.log("This post button is created")

        button = document.createElement("button")
        button.className = "edit_button"
        button.type = "button"
    }
    else{
        button = null
    }

    return button
}

function EditButtonBeingClicked(editButton) {
    const post = editButton.closest(".post")
    const photosDiv = post.querySelector(".post_photos")
    const textDiv = post.querySelector(".post_text")

    // 避免重複開啟編輯
    if (post.querySelector(".edit_form")) {
        postNotBeingEdited(editButton)
        return
    }

    // 建立 form 物件
    const editForm = document.createElement("form")
    editForm.className = "edit_form"
    editForm.method = "POST"

    // 編輯區 - 文字
    const textField = document.createElement("textarea")
    textField.placeholder = "Write something..."
    textField.className = "edit_text_field"
    textField.value = textDiv.innerText // 原本內容帶入
    textDiv.innerHTML = ""              // 清空原本文字
    textDiv.appendChild(textField)

    // 編輯區 - 上傳圖片按鈕（實體 input）
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.className = "input_for_editting_pic"
    fileInput.style.display = "none"
    fileInput.addEventListener("change", event => displayNewPhoto(event.target))

    // 點擊按鈕（假裝用 button 點 input）
    const uploadBtn = document.createElement("button")
    uploadBtn.type = "button"
    uploadBtn.className = "edit_photo_button"
    uploadBtn.addEventListener("click", () => fileInput.click())

    // 送出按鈕
    const submitButton = document.createElement("button")
    submitButton.innerText = "submit"
    submitButton.classList = "button button1 edit_submit_button"
    submitButton.type = "button"

    // 塞進 form
    editForm.appendChild(textDiv)
    editForm.appendChild(uploadBtn)
    editForm.appendChild(fileInput)
    editForm.appendChild(submitButton)

    post.insertBefore(editForm, photosDiv)
}


async function postNotBeingEdited(button){
    const post = button.closest(".post")
    const img = post.querySelector(".post_photos")
    const postId = post.id.split("_")[1]
    const textDiv = post.querySelector(".post_text")
    const editForm = post.querySelector(".edit_form")
    
    if(editForm){
        editForm.remove()
    }

    const response = await fetch(`http://127.0.0.1:8000/single_post/${postId}`)
    const data = await response.json()
    textDiv.innerHTML = data.text
    post.insertBefore(textDiv, img)
}

function submitEdittedContent(submitButton){
    const post = submitButton.closest(".post")
    const img = post.querySelector("input[type=file]").files[0]
    const text = post.querySelector(".edit_text_field").value
    const postId = post.id.split("_")[1]
    const csrftoken = getCookie("csrftoken")

    var data = new FormData()

    if(img){
        data.append("photos", img)
    }
    data.append("text", text)

    fetch(`http://127.0.0.1:8000/single_post/${postId}`, {
        method: "POST",
        headers: {
            "X-CSRFToken": csrftoken 
        },
        body: data

    }).then((message) => {
        console.log(message)
        postNotBeingEdited(submitButton)
    })
    .then(()=>{
        post.text = text
    }) //用single_post重新整理該頁面該有的模樣
}


function displayNewPhoto(inputField){
    const post = inputField.closest(".post")
    const img = post.querySelector("input[type=file]").files[0]
    const photo = post.querySelector(".original_photo")
    const reader = new FileReader()


    reader.addEventListener("load", ()=>{
        photo.src = reader.result
    })

    if(img){
        post.querySelector(".original_photo").src = reader.readAsDataURL(img)
    }
}


function nextPageButton(){
    const button = document.createElement("button")
    button.innerText = "Next page"
    button.className = "button button1 next_page_button"
    button.type = "button"

    return button
}

function  previousPageButton(){
    const button = document.createElement("button")
    button.innerText = "Previous page"
    button.classList = "button button1 previous_page_button"
    button.type = "button"

    return button
}

function addPageButton(){
     //避免重複生成按鈕
     if(document.querySelector(".change_page_button")){
        document.querySelector(".change_page_button").remove()
    }

    const maxPages = Number(sessionStorage.getItem("max_pages"))
    const currentPage = Number(sessionStorage.getItem("current_page"))||1
    const buttonDiv = document.createElement("div")
    buttonDiv.className = "change_page_button"

    if(currentPage == 1){
        buttonDiv.appendChild(nextPageButton())
    }else if(currentPage >= maxPages){
        buttonDiv.appendChild(previousPageButton())
    }else if(maxPages <= 1){
        return;
    }
    else{
        buttonDiv.appendChild(nextPageButton())
        buttonDiv.appendChild(previousPageButton())
    }

    document.body.appendChild(buttonDiv)
    
}

function renewPages(){
    const currentPage = sessionStorage.getItem("current_page")
    const currentPageName = sessionStorage.getItem("current_page_name")
    const pathString = currentPageName.split("/")
    const username = pathString[pathString.length - 1]
    let path

    if (currentPageName === "/") {
        path = `all_post/${currentPage}`
    } else if (currentPageName.includes("/profile_page")) {
        path = `user_post/${currentPage}`
    } else if (currentPageName.includes("/other_people_profile_page")) {
        path = `user_post/${currentPage}/${username}`
    } else if (currentPageName.includes("/following_page")) {
        path = `following_page_api/${currentPage}`
        }

    allPost(`http://127.0.0.1:8000/${path}`).then(message => {
        console.log(message)
        addPageButton()
    })
}


// Django's recommended way to build cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

