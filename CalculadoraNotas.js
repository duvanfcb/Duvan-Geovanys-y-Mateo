let estudiantes = [];
let porcentajes = [0, 0, 0];

// 🔥 VALIDACIÓN DE NOTAS
function validarNota(val, input) {
    let num = parseFloat(val);

    if (isNaN(num)) {
        return null;
    }

    if (num < 0) {
        alert("No se permiten notas negativas");
        input.value = "";
        return null;
    }

    if (num > 5) {
        alert("La nota no puede ser mayor a 5");
        input.value = "";
        return null;
    }

    return num;
}

// 🔥 ENCABEZADOS DINÁMICOS
function actualizarEncabezados() {
    document.getElementById("th-c1").textContent = `C1 (${porcentajes[0]}%)`;
    document.getElementById("th-c2").textContent = `C2 (${porcentajes[1]}%)`;
    document.getElementById("th-c3").textContent = `C3 (${porcentajes[2]}%)`;
}

// 🔥 PORCENTAJES
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

// 🔥 AGREGAR ESTUDIANTE
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
        c1: validarNota(document.getElementById("corte1").value, document.getElementById("corte1")),
        c2: validarNota(document.getElementById("corte2").value, document.getElementById("corte2")),
        c3: validarNota(document.getElementById("corte3").value, document.getElementById("corte3"))
    });

    e.target.reset();
    renderTabla();
});

// 🔥 DEFINITIVA
function calcularDef(e) {
    if (e.c1 == null || e.c2 == null || e.c3 == null) return null;

    return (
        e.c1 * porcentajes[0] / 100 +
        e.c2 * porcentajes[1] / 100 +
        e.c3 * porcentajes[2] / 100
    ).toFixed(2);
}

// 🔥 NOTA NECESARIA
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

// 🔥 TABLA
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

            // ✔ permitir decimales libres
            input.step = "any";

            input.min = 0;
            input.max = 5;

            input.onchange = () => {
                let val = parseFloat(input.value);

                if (isNaN(val)) {
                    e[campo] = null;
                    renderTabla();
                    return;
                }

                if (val < 0) {
                    alert("No se permiten notas negativas");
                    input.value = "";
                    e[campo] = null;
                    renderTabla();
                    return;
                }

                if (val > 5) {
                    alert("La nota no puede ser mayor a 5");
                    input.value = "";
                    e[campo] = null;
                    renderTabla();
                    return;
                }

                e[campo] = val;
                renderTabla();
            };

            return input;
        }

        tr.innerHTML = `
            <td>${e.nombre}</td>
            <td>${e.codigo}</td>
            <td></td>
            <td></td>
            <td></td>
            <td>${def ?? "Pendiente"}</td>
            <td>${def ? "N/A" : calcularNecesaria(e, 3)}</td>
            <td>${def ? "N/A" : calcularNecesaria(e, 5)}</td>
            <td></td>
        `;

        tr.children[2].appendChild(crearInput(e.c1, "c1"));
        tr.children[3].appendChild(crearInput(e.c2, "c2"));
        tr.children[4].appendChild(crearInput(e.c3, "c3"));

        const btn = document.createElement("button");
        btn.textContent = "Eliminar";
        btn.onclick = () => eliminar(i);

        tr.children[8].appendChild(btn);

        tbody.appendChild(tr);
    });
}

// 🔥 ELIMINAR
function eliminar(i) {
    estudiantes.splice(i, 1);
    renderTabla();
}

// 🔥 EXPORTAR CSV
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

// 🔥 IMPORTAR CSV
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
                c1: parseFloat(c1) || null,
                c2: parseFloat(c2) || null,
                c3: parseFloat(c3) || null
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
renderTabla();