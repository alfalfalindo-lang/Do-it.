const novoBtn=document.getElementById("novoBtn");
const notasBtn=document.getElementById("notasBtn");
const postitBtn=document.getElementById("postitBtn");
const modal=document.getElementById("modal");
const cancelar=document.getElementById("cancelar");
const fechar=document.querySelector(".fechar");
const criar=document.getElementById("criar");
const lista=document.getElementById("listaTarefas");
const titulo=document.getElementById("titulo");
const dataInput=document.getElementById("data");
const lixeira=document.getElementById("lixeira");

let corSelecionada="vermelha";

/* DATA TOPO */
const hoje=new Date();
document.getElementById("mesTopo").innerText=
hoje.toLocaleDateString("pt-BR",{month:"long"});
document.getElementById("diaTopo").innerText=hoje.getDate();

/* Selecionar cor */
document.querySelectorAll(".cor").forEach(btn=>{
 btn.onclick=()=>corSelecionada=btn.dataset.cor;
});

/* Modal */
novoBtn.onclick=()=>modal.style.display="flex";
cancelar.onclick=()=>modal.style.display="none";
fechar.onclick=()=>modal.style.display="none";

/* Criar tarefa */
criar.onclick=()=>{
 if(!titulo.value)return;

 const div=document.createElement("div");
 div.className="tarefa";

 const bolinha=document.createElement("div");
 bolinha.className="bolinha-tarefa";
 bolinha.style.background=
 corSelecionada==="vermelha"?"#ff3b30":
 corSelecionada==="amarela"?"#ffcc00":"#34c759";

 const texto=document.createElement("div");
 texto.innerHTML=`<strong>${titulo.value}</strong><br><small>${dataInput.value}</small>`;

 div.appendChild(bolinha);
 div.appendChild(texto);

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
 <textarea></textarea>
 `;

 document.body.appendChild(post);

 post.querySelector(".fechar-post").onclick=()=>post.remove();

 post.onmousedown=function(e){
   document.onmousemove=function(e2){
     post.style.left=e2.pageX-100+"px";
     post.style.top=e2.pageY-100+"px";
   };
   document.onmouseup=function(){
     document.onmousemove=null;
   };
 };

 post.onmouseup=function(){
   const lixoRect=lixeira.getBoundingClientRect();
   const postRect=post.getBoundingClientRect();

   if(
     postRect.right>lixoRect.left &&
     postRect.left<lixoRect.right &&
     postRect.bottom>lixoRect.top &&
     postRect.top<lixoRect.bottom
   ){
     post.remove();
   }
 };
};

/* NOTAS */
const modalNotas=document.getElementById("modalNotas");
const fecharNotas=document.querySelector(".fechar-notas");
const textarea=document.getElementById("paginaAtual");
const numeroPagina=document.getElementById("numeroPagina");
const paginaAnterior=document.getElementById("paginaAnterior");
const proximaPagina=document.getElementById("proximaPagina");
const novaPagina=document.getElementById("novaPagina");

let paginas=[""];
let paginaAtual=0;

notasBtn.onclick=()=>modalNotas.style.display="flex";
fecharNotas.onclick=()=>modalNotas.style.display="none";

function atualizarPagina(){
 textarea.value=paginas[paginaAtual];
 numeroPagina.innerText=paginaAtual+1;
}

textarea.oninput=()=>{
 paginas[paginaAtual]=textarea.value;
};

paginaAnterior.onclick=()=>{
 if(paginaAtual>0){
  paginaAtual--;
  atualizarPagina();
 }
};

proximaPagina.onclick=()=>{
 if(paginaAtual<paginas.length-1){
  paginaAtual++;
  atualizarPagina();
 }
};

novaPagina.onclick=()=>{
 paginas.push("");
 paginaAtual=paginas.length-1;
 atualizarPagina();
};

atualizarPagina();
