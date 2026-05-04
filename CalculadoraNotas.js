let estudiantes = [];
let porcentajes = [0, 0, 0];

// 🔥 ENCABEZADOS DINÁMICOS
function actualizarEncabezados() {
    document.getElementById("th-c1").textContent = `C1 (${porcentajes[0]}%)`;
    document.getElementById("th-c2").textContent = `C2 (${porcentajes[1]}%)`;
    document.getElementById("th-c3").textContent = `C3 (${porcentajes[2]}%)`;
}

document.getElementById("porcentaje-form").addEventListener("submit", e => {
    e.preventDefault();

    let p1 = parseFloat(document.getElementById("corte1-porcentaje").value) || 0;
    let p2 = parseFloat(document.getElementById("corte2-porcentaje").value) || 0;
    let p3 = parseFloat(document.getElementById("corte3-porcentaje").value) || 0;

    let total = p1 + p2 + p3;

    if (p1 < 0 || p2 < 0 || p3 < 0) {
        alert("Los porcentajes no pueden ser negativos");
        return;
    }

    if (total !== 100) {
        alert("Los porcentajes deben sumar exactamente 100%");
        return;
    }

    porcentajes = [p1, p2, p3];

    actualizarEncabezados();
    renderTabla();
});

document.getElementById("estudiante-form").addEventListener("submit", e => {
    e.preventDefault();

    let codigo = document.getElementById("codigo").value.trim();

    let existe = estudiantes.some(est => est.codigo === codigo);
    if (existe) {
        alert("Ya existe un estudiante con ese código");
        return;
    }

    estudiantes.push({
        nombre: document.getElementById("nombre").value.trim(),
        codigo: codigo,
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

// 🔥 TABLA CON EDICIÓN DIRECTA
function renderTabla() {
    const tbody = document.querySelector("#estudiantes-table tbody");
    tbody.innerHTML = "";

    estudiantes.sort((a, b) => {
        let numA = Number(a.codigo);
        let numB = Number(b.codigo);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        } else {
            return a.codigo.localeCompare(b.codigo);
        }
    });

    estudiantes.forEach((e, i) => {
        const tr = document.createElement("tr");

        const def = calcularDef(e);

        function crearInput(valor, campo) {
            const input = document.createElement("input");
            input.type = "number";
            input.value = valor ?? "";
            input.style.width = "60px";

            // 🔥 límites
            input.min = 0;
            input.max = 5;
            input.step = 0.1;

            input.onchange = () => {
                let val = parseFloat(input.value);

                if (isNaN(val)) {
                    e[campo] = null;
                } else {
                    e[campo] = val;
                }

                renderTabla();
            };

            return input;
        }

        // Nombre
        let tdNombre = document.createElement("td");
        tdNombre.textContent = e.nombre;
        tr.appendChild(tdNombre);

        // Código
        let tdCodigo = document.createElement("td");
        tdCodigo.textContent = e.codigo;
        tr.appendChild(tdCodigo);

        // Editables
        let tdC1 = document.createElement("td");
        tdC1.appendChild(crearInput(e.c1, "c1"));
        tr.appendChild(tdC1);

        let tdC2 = document.createElement("td");
        tdC2.appendChild(crearInput(e.c2, "c2"));
        tr.appendChild(tdC2);

        let tdC3 = document.createElement("td");
        tdC3.appendChild(crearInput(e.c3, "c3"));
        tr.appendChild(tdC3);

        // Definitiva
        let tdDef = document.createElement("td");
        tdDef.textContent = def ?? "Pendiente";
        tr.appendChild(tdDef);

        // Predicciones
        let td3 = document.createElement("td");
        td3.textContent = def ? "N/A" : calcularNecesaria(e, 3);
        tr.appendChild(td3);

        let td5 = document.createElement("td");
        td5.textContent = def ? "N/A" : calcularNecesaria(e, 5);
        tr.appendChild(td5);

        // Eliminar
        let tdBtn = document.createElement("td");
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

// EXPORTAR CSV
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

// IMPORTAR CSV
document.getElementById("importar-btn").onclick = () => {
    document.getElementById("importar-csv").click();
};

document.getElementById("importar-csv").onchange = function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
        const lineas = e.target.result.split("\n").slice(1);

        lineas.forEach(f => {
            const [n, c, c1, c2, c3] = f.split(",");
            if (!n) return;

            let nuevo = {
                nombre: n.trim(),
                codigo: c.trim(),
                c1: c1 ? parseFloat(c1) : null,
                c2: c2 ? parseFloat(c2) : null,
                c3: c3 ? parseFloat(c3) : null
            };

            let index = estudiantes.findIndex(e => e.codigo === nuevo.codigo);

            if (index !== -1) {
                let actual = estudiantes[index];

                estudiantes[index] = {
                    nombre: nuevo.nombre || actual.nombre,
                    codigo: actual.codigo,
                    c1: nuevo.c1 ?? actual.c1,
                    c2: nuevo.c2 ?? actual.c2,
                    c3: nuevo.c3 ?? actual.c3
                };
            } else {
                estudiantes.push(nuevo);
            }
        });

        this.value = "";
        renderTabla();
    };

    reader.readAsText(file);
};

// 🔥 INICIALIZACIÓN
actualizarEncabezados();