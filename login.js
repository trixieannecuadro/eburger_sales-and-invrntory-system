function register(){
  let user = document.getElementById("newUser").value;
  let pass = document.getElementById("newPass").value;
  localStorage.setItem("adminUser",user);
  localStorage.setItem("adminPass",pass);
  alert("Account created!"); window.location.href="login.html";
}
function login(){
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;
  let savedUser = localStorage.getItem("adminUser");
  let savedPass = localStorage.getItem("adminPass");
  if(user===savedUser && pass===savedPass){window.location.href="pages/dashboard.html";}
  else{alert("Invalid login");}
}