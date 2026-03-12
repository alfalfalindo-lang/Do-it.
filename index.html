let tarefas=JSON.parse(localStorage.getItem("tarefas"))||[];
let metas=JSON.parse(localStorage.getItem("metas"))||[];
let postits=JSON.parse(localStorage.getItem("postits"))||[];

let modo="tarefas";

let corSelecionada="#ff3b30";

/* data */

const hoje=new Date();

mesTopo.innerText=hoje.toLocaleDateString("pt-BR",{month:"long"});
diaTopo.innerText=hoje.getDate();

/* salvar */

function salvar(){

localStorage.setItem("tarefas",JSON.stringify(tarefas));
localStorage.setItem("metas",JSON.stringify(metas));
localStorage.setItem("postits",JSON.stringify(postits));

}

/* render */

function render(){

listaTarefas.innerHTML="";

let lista=(modo==="metas")?metas:tarefas;

lista.forEach((t,i)=>{

let div=document.createElement("div");

div.className="tarefa";

div.innerHTML=`
<div class="bolinha" style="background:${t.cor}"></div>
<div>${t.titulo}</div>
`;

div.onclick=()=>{

lista.splice(i,1);

salvar();

render();

};

listaTarefas.appendChild(div);

});

}

render();

/* criar */

criar.onclick=()=>{

let obj={

titulo:titulo.value,
cor:corSelecionada

};

if(modo==="metas")metas.push(obj);
else tarefas.push(obj);

salvar();

render();

modal.style.display="none";

};

/* modal */

novoBtn.onclick=()=>modal.style.display="flex";

cancelar.onclick=()=>modal.style.display="none";

document.querySelector(".fechar").onclick=()=>modal.style.display="none";

/* cores */

document.querySelectorAll(".cor").forEach(btn=>{

btn.onclick=()=>corSelecionada=btn.dataset.cor;

});

/* modos */

tarefasBtn.onclick=()=>{modo="tarefas";render()}
metasBtn.onclick=()=>{modo="metas";render()}

/* notas */

notasBtn.onclick=()=>modalNotas.style.display="flex";

document.querySelector(".fechar-notas").onclick=()=>modalNotas.style.display="none";

/* post it */

postitBtn.onclick=()=>{

let obj={top:"200px",left:"300px",texto:""};

postits.push(obj);

criarPostit(obj);

salvar();

};

function criarPostit(p){

let div=document.createElement("div");

div.className="postit";

div.style.top=p.top;
div.style.left=p.left;

div.innerHTML=`<textarea>${p.texto}</textarea>`;

document.body.appendChild(div);

/* drag */

div.onmousedown=e=>{

let offsetX=e.clientX-div.offsetLeft;
let offsetY=e.clientY-div.offsetTop;

document.onmousemove=e=>{

div.style.left=e.clientX-offsetX+"px";
div.style.top=e.clientY-offsetY+"px";

p.left=div.style.left;
p.top=div.style.top;

};

document.onmouseup=()=>{

document.onmousemove=null;

let lixo=lixeira.getBoundingClientRect();
let post=div.getBoundingClientRect();

if(

post.right>lixo.left &&
post.left<lixo.right &&
post.bottom>lixo.top &&
post.top<lixo.bottom

){

div.remove();

postits=postits.filter(x=>x!==p);

salvar();

}

};

};

}

postits.forEach(p=>criarPostit(p));
