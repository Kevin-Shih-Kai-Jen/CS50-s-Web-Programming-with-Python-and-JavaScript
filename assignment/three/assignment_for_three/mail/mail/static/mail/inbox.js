document.addEventListener('DOMContentLoaded', function() {

  // By default, load the inbox
  get_emails("email_sent_to_you", "being_sent").then((emails) => {
    readBackgroundColor(emails)
    load_mailbox('inbox');
  });

  // click inbox
  document.querySelector('#inbox').addEventListener('click', () => {
    get_emails("email_sent_to_you", "being_sent").then((emails) => {
      readBackgroundColor(emails)
      load_mailbox('inbox');
    });
  });

  // click sent
  document.querySelector('#sent').addEventListener('click', () => {
    get_emails("get_user_email", "send").then((emails) => {
      readBackgroundColor(emails)
      load_mailbox('sent');
    });
  });

  document.querySelector('#archived').addEventListener('click', () => {
    get_emails("archived_email", "archive").then((emails) => {
      readBackgroundColor(emails)
      load_mailbox('archive')
  })
})

  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', extract_email);


  //Email details nutton
  const emailDetailsDiv = document.getElementById("emails-view")

  emailDetailsDiv.addEventListener("click", (event)=>{
    if(event.target.matches("button.Email_details_button")){
      const message = click_button(event.target.id)
      console.log(message)
    }
  })


    // archive button
    emailDetailsDiv.addEventListener("click", (event)=>{
      if(event.target.matches("button.archive_button")){
        console.log("archive_button is triggered")
        archiveClickButton(event.target.id)
      }
    })

    // reply button
    emailDetailsDiv.addEventListener("click",(event)=>{
      if(event.target.matches("button.reply_email")){
        console.log("reply_button is triggered")
        replyEmail(event.target.id)
      }
    })
    
    //send replied email button
    const replyEmailForm = document.getElementById("reply_email")

    replyEmailForm.addEventListener("submit", (event)=>{
      event.preventDefault();
      sendRepliedEmail(); 
      load_mailbox("sent")
    })

})


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#reply_email').style.display = 'none';

  // Show the mailbox name and sent email
  const all_h3_blocks = document.getElementById("emails-view").querySelectorAll("h3");

  //make the mailbox name not able to pile up
  all_h3_blocks.forEach(item =>item.remove()); 
  
  const header =  document.createElement("h3");
  header.innerText = mailbox.charAt(0).toUpperCase() + mailbox.slice(1);
  const whole_block = document.getElementById('emails-view');
  const block = whole_block.firstChild;

  //make the firstly created email's position below the mailbox name
  whole_block.insertBefore(header, block);

  //我自己加的功能
  document.querySelector('#previousPageButton').style.display = 'none';
 }

 
 





function extract_email(event){
      event.preventDefault();

      let recipients = document.querySelector("#compose-recipients").value;
      let subject = document.querySelector("#compose-subject").value;
      let body = document.querySelector('#compose-body').value;
      

      fetch("/emails",{
        method: 'POST',
        headers:{
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
        })
    })
      .then(response => response.json())
      .then(data =>{
        console.log(data);
        get_emails("get_user_email", "send")
        .then((emails) =>{
          readBackgroundColor(emails)
          try{
          console.log("The email is sent")
          load_mailbox('sent');
          
        }catch(error){
          console.log(error);
          throw "The mail is not sent"
        }
          
      });
      
      });
      
    }
    


  



async function get_emails(path, being_sent_or_send){
  const data = await fetch(path);
  const emails = await data.json();
  let emails_view = document.getElementById("emails-view")
  
  
  
  if(emails_view.innerHTML !== null){
    emails_view.innerHTML = ""
  }
  

  if(emails.length === 0){
    const block = document.createElement("h2")
    const message = document.createTextNode("You have no emails, poor you")
    block.appendChild(message)
    emails_view.appendChild(block)
  }

  
  
  for(let email of emails){
    let emailDiv = document.createElement("div")
    let senderDiv
    let button = createButton(email.id)
    

    let subjectDiv = addElement("Subject:", `${email.subject}`)
    let timestampDiv = addElement("Time", `${email.timestamp}`)

    if(being_sent_or_send === "being_sent"){
      senderDiv = addElement("From:", `${email.sender}`)
      let archive_button = archivedButton(email.id)
      let reply_button = replyEmailButton(email)
      var item_list = [senderDiv, subjectDiv, timestampDiv, button, archive_button, reply_button]

  }else if(being_sent_or_send === "send"){
      senderDiv = addElement("To:", `${email.recipients.join(", ")}`)
      var item_list = [senderDiv, subjectDiv, timestampDiv, button]

  }else if(being_sent_or_send === "archive"){
    senderDiv = addElement("From:", `${email.sender}`)
    recipientsDiv = addElement("To:", `${email.recipients.join(", ")}`)
    let archive_button = archivedButton(email.id)
    var item_list = [senderDiv, recipientsDiv, subjectDiv, timestampDiv, button, archive_button]
  }


    item_list.forEach(item => emailDiv.appendChild(item))

    emails_view.appendChild(emailDiv)

  }

  
  return emails

  
  }

  function addElement(item_discriptions, item_content){

    // 包含參數一、參數二的div，在這個email的div下面
    let itemDiv = document.createElement("div") 

    //各個參數的div，加了這個操作比叫方便
    let div_1 = document.createElement("div")
    let div_2 = document.createElement("div")

    div_1.innerHTML = item_discriptions
    div_2.innerHTML = item_content

    itemDiv.appendChild(div_1)
    itemDiv.appendChild(div_2)
    
    return itemDiv
}



// 按扭區
function createButton(email_id) {
  const button = document.createElement("button");

  button.textContent = "Email Details";
  button.id = `Email_details_button_${email_id}`;
  button.className = `Email_details_button`

  return button;
}


function click_button(button_id){

  //字串的第四個字
  const email_id = button_id.split("_")[3]

  readRecord(email_id)
  check_email_exists(email_id)
  

  fetch(`emails/${email_id}`).then(
    response => response.json()
  ).then( 
    email =>{
      console.log("button clicked and email is extracted successfully")
      emailDetails(email)
    } 
  )
  
  
function emailDetails(email){
  var content = document.getElementById("emails-view")
  content.innerHTML = ""

  console.log("Email: ",email)

  if(email.error){
    const errorDiv = document.createElement("p")
    errorDiv.innerHTML = "This email does not exist"
    content.appendChild(errorDiv)

    return;
  }

  let senderDiv = addElement("From:", `${email.sender}`)
  let recipientsDiv = addElement("To:", `${email.recipients.join(", ")}`)
  let subjectDiv = addElement("Subject:", `${email.subject}`)
  let bodyDiv = addElement("Body:", `${email.body}`)
  let timestampDiv = addElement("Sent time:", `${email.timestamp}`)
  
  const itemList = [senderDiv, recipientsDiv, subjectDiv, bodyDiv, timestampDiv]

  for(item of itemList){
    content.appendChild(item)
  }
}}



function readRecord(email_id){

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  }).then(()=>{
    console.log("This email has been read")
})
}


function readBackgroundColor(emails){

    for(let i=0; i<emails.length; i++){
      var emailsViewChild = document.getElementById("emails-view").childNodes
      

      if(emails[i].read){
        emailsViewChild[i].style.background = "lightgray"
        console.log("The color has changed sucessfully")
      }
    }
}
  

async function check_email_exists(email_id){
  const data = await fetch(`emails/${email_id}`)
  const email = await data.json()
  
  console.log("The existence of this email: ", email)
  console.log("The email's id: ", email_id)

  return "check_email_exists"
}

function archivedButton(email_id){
  const button = document.createElement("button")
  button.className = "archive_button"
  button.id = `archive_button_${email_id}`
  button.textContent = "archive"
  changeArchivedButtonColor(email_id)

  return button
}


function archiveClickButton(button_id){
  var email_id = button_id.split("_")[2]
  console.log("archiveClickButton: ", email_id)
  console.log("archiveClickButton button_id: ", button_id)

  fetch(`emails/${email_id}`)
  .then(response=> response.json())
  .then(email =>{
    const bool_value = !email.archived;

    fetch(`emails/${email_id}`,{
      method: "PUT",
      body: JSON.stringify({
        archived: bool_value
      })
    }).then(()=>{
      console.log("This email has been archived hahaha lol wtf");
      changeArchivedButtonColor(email_id);
      load_mailbox('inbox');
  })
  })


  
 
}

function changeArchivedButtonColor(email_id){
  fetch(`emails/${email_id}`)
  .then(response=> response.json())
  .then((email)=>{
    var button = document.getElementById(`archive_button_${email_id}`)

    if(email.archived){
      button.style.backgroundColor = "lightblue"
      button.style.opacity = "0.5"
      button.textContent = "Unarchive"
    }else{
      button.style.backgroundColor = "lightgray"
      button.style.opacity = "1"
      button.textContent = "archive"
    }
  }
  )
}

async function replyEmail(button_id){

  //那個 div 裡面的東西
    var reply_email_field = document.getElementById("reply_email");
    var compose_reply_form = document.getElementById("compose-reply-form");

    //預設的信件內容
    compose_reply_form.reset();


    var reply_recipients = document.getElementById("compose-reply-recipients");
    var reply_subject = document.getElementById("compose-reply-subject");
    var reply_body = document.getElementById("compose-reply-body");

    reply_recipients.value = '';
    reply_subject.value = '';
    reply_body.value = '';

    //原先的 email
    const email_id = button_id.split("_")[2];
    const data = await fetch(`emails/${email_id}`);
    const email = await data.json();

    //顯示、不顯示 div
    document.getElementById("emails-view").style.display = "none";
    document.getElementById("compose-view").style.display = "none";
    document.getElementById("inner_email_div").style.id = "none";
    reply_email_field.style.display = "block";

    
    reply_recipients.value = email.sender;
    reply_subject.value = `Re: ${email.subject}`;
    reply_subject.style.marginBottom = "10px";
    reply_body.value = `On ${email.timestamp} ${email.sender} wrote: \n${email.body} `;
    console.log("replyEmail triggered with:", email_id);


    return "Reply design has been constructed";
}

function replyEmailButton(email){
  const button = document.createElement("button")
  button.id = `reply_email_${email.id}`
  button.className = "reply_email"
  button.textContent = "reply"
  
  return button
}

function sendRepliedEmail(){
  var recipients = document.getElementById("compose-reply-recipients")
  var subject = document.getElementById("compose-reply-subject")
  var body = document.getElementById("compose-reply-body")

  fetch("/emails",{
    method: 'POST',
    headers:{
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value
    })
  }).then(response => response.json())
  .then(data =>{
    console.log(data);
    console.log(`This replied email has been sent`)
    get_emails("get_user_email", "send").then(emails =>readBackgroundColor(emails))
  })
}
