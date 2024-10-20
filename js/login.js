let email=document.querySelector("#email")
let pswd=document.querySelector("#pwd")
const loginBtn=document.querySelector(".login")
let user={
    email:"mohamed@gmail.com",
    password:"Mohamed12345#"
}
// login fun
loginBtn.addEventListener('click',function(stop){
    stop.preventDefault()
    if(email.value===user.email && pswd.value===user.password){
        setTimeout(()=>{
            window.location='upload.html'
        },2000)
    }
    else{
        alert('Invalid Credentials!')
    }
        
})