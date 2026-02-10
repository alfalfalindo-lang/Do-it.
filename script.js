let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

function mostrarFormulario() {
    document.getElementById("formulario").classList.toggle("hidden");
}

function adicionar() {
    const texto = document.getElementById("texto").value;
    const data = document.getElementById("data").value;
    const prioridade = document.getElementById("prioridade").value;

    if (!texto || !data) {
        alert("Preencha tudo!");
        return;
    }

    tarefas.push({
        texto,
        data,
        prioridade,
        feito: false
    });

    salvar();
    mostrar();
}

function marcar(index) {
    tarefas[index].feito = !tarefas[index].feito;
    salvar();
    mostrar();
}

function mostrar() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    tarefas.forEach((t, i) => {
        const li = document.createElement("li");
        li.classList.add(t.prioridade);
        if (t.feito) li.classList.add("feito");

        li.innerHTML = `
            <div class="check" onclick="marcar(${i})"></div>
            <div>
                <strong>${t.texto}</strong><br>
                <small>${t.data}</small>
            </div>
        `;

        lista.appendChild(li);
    });
}

function salvar() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

mostrar();
