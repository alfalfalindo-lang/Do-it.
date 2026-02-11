const novoBtn=document.getElementById("novoBtn");
const modal=document.getElementById("modal");
const fechar=document.querySelector(".fechar");
const criar=document.getElementById("criar");
const lista=document.getElementById("listaTarefas");
const dataSelect=document.getElementById("data");
const titulo=document.getElementById("titulo");
const postitBtn=document.getElementById("postitBtn");

let corSelecionada="vermelha";

/* Data topo */
const dataTopo=document.getElementById("dataTopo");
const hoje=new Date();
dataTopo.innerText=hoje.toLocaleDateString("pt-BR",{day:'numeric',month:'long'});

/* Popular datas */
for(let i=0;i<30;i++){
 let d=new Date();
 d.setDate(d.getDate()+i);
 let option=document.createElement("option");
 option.value=d.toLocaleDateString();
 option.textContent=d.toLocaleDateString();
 dataSelect.appendChild(option);
}

/* Seleção cor */
document.querySelectorAll(".cor").forEach(btn=>{
 btn.onclick=()=>corSelecionada=btn.dataset.cor;
});

/* Modal */
novoBtn.onclick=()=>modal.style.display="flex";
fechar.onclick=()=>modal.style.display="none";

/* Criar tarefa */
criar.onclick=()=>{
 if(!titulo.value)return;

 const div=document.createElement("div");
 div.className="tarefa";
 div.style.borderLeft=`8px solid ${
  corSelecionada==="vermelha"?"#ff3b30":
  corSelecionada==="amarela"?"#ffcc00":
  "#34c759"
 }`;

 div.innerHTML=`
 <strong>${titulo.value}</strong>
 <div class="data">${dataSelect.value}</div>
 `;

 div.onclick=()=>div.classList.toggle("feita");

 lista.appendChild(div);
 titulo.value="";
 modal.style.display="none";
};

/* POST IT */
postitBtn.onclick=()=>{
 const post=document.createElement("div");
 post.className="postit";
 post.style.top="200px";
 post.style.left="300px";

 post.innerHTML=`
 <div class="fechar-post">×</div>
 <textarea placeholder="Escreva..."></textarea>
 `;

 document.body.appendChild(post);

 post.querySelector(".fechar-post").onclick=()=>post.remove();

 post.onmousedown=function(e){
   let shiftX=e.clientX-post.getBoundingClientRect().left;
   let shiftY=e.clientY-post.getBoundingClientRect().top;

   function moveAt(pageX,pageY){
     post.style.left=pageX-shiftX+"px";
     post.style.top=pageY-shiftY+"px";
   }

   function onMouseMove(e){
     moveAt(e.pageX,e.pageY);
   }

   document.addEventListener("mousemove",onMouseMove);

   document.onmouseup=function(){
     document.removeEventListener("mousemove",onMouseMove);
     document.onmouseup=null;
   };
 };
};

