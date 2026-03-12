let tarefas=JSON.parse(localStorage.getItem("tarefas"))||[];
let metas=JSON.parse(localStorage.getItem("metas"))||[];
let postits=JSON.parse(localStorage.getItem("postits"))||[];

let modo="tarefas";
let tipoCriacao="tarefa";

let corSelecionada="#ff3b30";

/* DATA */

const hoje=new Date();

mesTopo.innerText=hoje.toLocaleDateString("pt-BR",{month:"long"});
diaTopo.innerText=hoje.getDate();

/* RESET METAS MENSAL */

const mesAtual=hoje.getMonth();
const mesSalvo=localStorage.getItem("mesMetas");

if(mesSalvo!=mesAtual){

metas=[];
localStorage.setItem("mesMetas",mesAtual);

}

/* SALVAR */

function salvar(){

localStorage.setItem("tarefas",JSON.stringify(tarefas));
localStorage.setItem("metas",JSON.stringify(metas));
localStorage.setItem("postits",JSON.stringify(postits));

}

/* RENDER */

function render(){

listaTarefas.innerHTML="";

let lista=[];

if(modo==="tarefas")lista=tarefas;
if(modo==="metas")lista=metas;

if(modo==="incompletas"){

lista=[

...tarefas.filter(t=>!t.feita),
...metas.filter(t=>!t.feita)

];

}

lista.forEach(t=>{

let div=document.createElement("div");

div.className="tarefa";

if(t.feita)div.classList.add("feita");

div.innerHTML=`
<div class="bolinha" style="background:${t.cor}"></div>
<div>${t.titulo}</div>
`;

div.onclick=()=>{

t.feita=!t.feita;

salvar();

render();

};

listaTarefas.appendChild(div);

});

}

render();

/* CRIAR */

criar.onclick=()=>{

let obj={

titulo:titulo.value,
cor:corSelecionada,
feita:false

};

if(tipoCriacao==="meta")metas.push(obj);
else tarefas.push(obj);

salvar();

render();

modal.style.display="none";

};

/* MODAL */

novoBtn.onclick=()=>{

tipoCriacao="tarefa";

tituloModal.innerText="nova tarefa";

modal.style.display="flex";

};

novaMetaBtn.onclick=()=>{

tipoCriacao="meta";

tituloModal.innerText="nova meta";

modal.style.display="flex";

};

cancelar.onclick=()=>modal.style.display="none";

document.querySelector(".fechar").onclick=()=>modal.style.display="none";

/* CORES */

document.querySelectorAll(".cor").forEach(btn=>{

btn.onclick=()=>{

corSelecionada=btn.dataset.cor;

};

});

/* MODOS */

tarefasBtn.onclick=()=>{modo="tarefas";render();}
metasBtn.onclick=()=>{modo="metas";render();}
incompletasBtn.onclick=()=>{modo="incompletas";render();}

/* POST IT */

postitBtn.onclick=()=>{

let obj={top:"150px",left:"350px",texto:""};

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

/* DRAG */

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

/* APAGAR NA LIXEIRA */

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
