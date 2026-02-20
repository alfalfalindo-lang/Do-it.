let tarefas=[];
let metas=[];
let modo="tarefas";
let corSelecionada="vermelha";

/* DATA */
const hoje=new Date();
mesTopo.innerText=hoje.toLocaleDateString("pt-BR",{month:"long"});
diaTopo.innerText=hoje.getDate();

/* BOTÕES */
tarefasBtn.onclick=()=>{modo="tarefas";renderizar();}
metasBtn.onclick=()=>{modo="metas";renderizar();}
incompletasBtn.onclick=()=>{modo="incompletas";renderizar();}

novoBtn.onclick=()=>modal.style.display="flex";
cancelar.onclick=()=>modal.style.display="none";
document.querySelector(".fechar").onclick=()=>modal.style.display="none";

/* COR */
document.querySelectorAll(".cor").forEach(btn=>{
 btn.onclick=()=>corSelecionada=btn.dataset.cor;
});

/* CRIAR */
criar.onclick=()=>{
 if(!titulo.value)return;

 const nova={
   titulo:titulo.value,
   data:data.value,
   cor:corSelecionada,
   feita:false
 };

 if(modo==="metas") metas.push(nova);
 else tarefas.push(nova);

 titulo.value="";
 modal.style.display="none";
 renderizar();
};

/* RENDER */
function renderizar(){
 listaTarefas.innerHTML="";

 let listaAtual=[];

 if(modo==="tarefas") listaAtual=tarefas;
 if(modo==="metas") listaAtual=metas;
 if(modo==="incompletas")
   listaAtual=tarefas.filter(t=>!t.feita);

 listaAtual.forEach(item=>{
   const div=document.createElement("div");
   div.className="tarefa";
   if(item.feita) div.classList.add("feita");

   const bolinha=document.createElement("div");
   bolinha.className="bolinha-tarefa";
   bolinha.style.background=
     item.cor==="vermelha"?"#ff3b30":
     item.cor==="amarela"?"#ffcc00":"#34c759";

   const texto=document.createElement("div");
   texto.innerHTML=`<strong>${item.titulo}</strong><br><small>${item.data}</small>`;

   div.appendChild(bolinha);
   div.appendChild(texto);

   div.onclick=()=>{
     item.feita=!item.feita;
     renderizar();
   };

   listaTarefas.appendChild(div);
 });
}

renderizar();
