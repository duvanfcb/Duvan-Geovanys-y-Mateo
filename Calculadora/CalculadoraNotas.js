let estudiantes = [];
let porcentajes = [30, 30, 40];

document.getElementById("porcentaje-form").addEventListener("submit", e => {
    e.preventDefault();

    porcentajes = [
        parseFloat(document.getElementById("corte1-porcentaje").value) || 0,
        parseFloat(document.getElementById("corte2-porcentaje").value) || 0,
        parseFloat(document.getElementById("corte3-porcentaje").value) || 0
    ];

    alert("Porcentajes guardados");
    renderTabla();
});

document.getElementById("estudiante-form").addEventListener("submit", e => {
    e.preventDefault();

    estudiantes.push({
        nombre: document.getElementById("nombre").value,
        codigo: document.getElementById("codigo").value,
        c1: parseFloat(document.getElementById("corte1").value) || null,
        c2: parseFloat(document.getElementById("corte2").value) || null,
        c3: parseFloat(document.getElementById("corte3").value) || null
    });

    e.target.reset();
    renderTabla();
});

function calcularDef(e) {
    if (e.c1 == null || e.c2 == null || e.c3 == null) return null;

    return (
        e.c1 * porcentajes[0] / 100 +
        e.c2 * porcentajes[1] / 100 +
        e.c3 * porcentajes[2] / 100
    ).toFixed(2);
}

function calcularNecesaria(e, objetivo) {
    let suma = 0;
    let peso = 0;

    if (e.c1 != null) suma += e.c1 * porcentajes[0] / 100;
    else peso += porcentajes[0];

    if (e.c2 != null) suma += e.c2 * porcentajes[1] / 100;
    else peso += porcentajes[1];

    if (e.c3 != null) suma += e.c3 * porcentajes[2] / 100;
    else peso += porcentajes[2];

    if (peso === 0) return "N/A";

    let necesaria = (objetivo - suma) / (peso / 100);

    if (necesaria > 5) return "Imposible";
    if (necesaria < 0) return "0.0";

    return necesaria.toFixed(2);
}

function renderTabla() {
    const tbody = document.querySelector("#estudiantes-table tbody");
    tbody.innerHTML = "";

    estudiantes.forEach((e, i) => {
        const tr = document.createElement("tr");

        const def = calcularDef(e);

        const datos = [
            e.nombre,
            e.codigo,
            e.c1 ?? "-",
            e.c2 ?? "-",
            e.c3 ?? "-",
            def ?? "Pendiente",
            def ? "N/A" : calcularNecesaria(e, 3),
            def ? "N/A" : calcularNecesaria(e, 5)
        ];

        datos.forEach(d => {
            const td = document.createElement("td");
            td.textContent = d;
            tr.appendChild(td);
        });

        const tdBtn = document.createElement("td");
        const btn = document.createElement("button");

        btn.textContent = "Eliminar";
        btn.onclick = () => eliminar(i);

        tdBtn.appendChild(btn);
        tr.appendChild(tdBtn);

        tbody.appendChild(tr);
    });
}

function eliminar(i) {
    estudiantes.splice(i, 1);
    renderTabla();
}

document.getElementById("exportar-btn").onclick = () => {
    let csv = "Nombre,Codigo,C1,C2,C3\n";

    estudiantes.forEach(e => {
        csv += `${e.nombre},${e.codigo},${e.c1 ?? ""},${e.c2 ?? ""},${e.c3 ?? ""}\n`;
    });

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "estudiantes.csv";
    a.click();
};

document.getElementById("importar-btn").onclick = () => {
    document.getElementById("importar-csv").click();
};

document.getElementById("importar-csv").onchange = function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
        estudiantes = [];

        e.target.result.split("\n").slice(1).forEach(f => {
            const [n, c, c1, c2, c3] = f.split(",");
            if (!n) return;

            estudiantes.push({
                nombre: n,
                codigo: c,
                c1: c1 ? parseFloat(c1) : null,
                c2: c2 ? parseFloat(c2) : null,
                c3: c3 ? parseFloat(c3) : null
            });
        });

        renderTabla();
    };

    reader.readAsText(file);
};