const fotosPorSeccion = {
    fotos_chasis: [],
    fotos_carroceria: [],
    fotos_interior: [],
    fotos_mecanica: [],
    fotos_electronica: [],
    fotos_prueba: [],
    fotos_resumen: []
};

function manejarFotos(id) {
    const input = document.getElementById(id);

    if (!input) return;

    input.addEventListener("change", () => {
        const archivos = Array.from(input.files);

        fotosPorSeccion[id].push(...archivos);

        console.log(id, fotosPorSeccion[id]);

        mostrarPreview(id);

        input.value = "";
    });
}

[
    "fotos_chasis",
    "fotos_carroceria",
    "fotos_interior",
    "fotos_mecanica",
    "fotos_electronica",
    "fotos_prueba",
    "fotos_resumen"
].forEach(manejarFotos);


const botonesAcordeon = document.querySelectorAll(".acordeon-btn");

botonesAcordeon.forEach((boton) => {
    boton.addEventListener("click", () => {
        const item = boton.parentElement;
        item.classList.toggle("activo");
    });
});

function mostrarPreview(id) {
    const preview = document.getElementById("preview_" + id);
    if (!preview) return;

    preview.innerHTML = "";

    fotosPorSeccion[id].forEach((file, index) => {
        const contenedor = document.createElement("div");
        contenedor.classList.add("preview-item");

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);

        const botonEliminar = document.createElement("button");
        botonEliminar.innerText = "✕";
        botonEliminar.classList.add("btn-eliminar");

        botonEliminar.addEventListener("click", () => {
            fotosPorSeccion[id].splice(index, 1);
            mostrarPreview(id); // refresca
        });

        contenedor.appendChild(img);
        contenedor.appendChild(botonEliminar);
        preview.appendChild(contenedor);
    });
}
async function enviarWhatsApp() {

    const formData = new FormData();

    const telefonoInput = document.getElementById("telefono").value;

    // DATOS DEL CLIENTE
    formData.append("cliente", document.getElementById("cliente").value);
    formData.append("telefono", telefonoInput);

    // DATOS DEL VEHÍCULO
    formData.append("marca", document.getElementById("marca").value);
    formData.append("modelo", document.getElementById("modelo").value);
    formData.append("anio", document.getElementById("anio").value);
    formData.append("kms", document.getElementById("kms").value);
    formData.append("matricula", document.getElementById("matricula").value);
    formData.append("estado", document.getElementById("estado").value);

    // COMENTARIOS / TEXTOS
    formData.append("chasis", document.getElementById("chasis").value);
    formData.append("carroceria", document.getElementById("carroceria").value);
    formData.append("interior", document.getElementById("interior").value);
    formData.append("mecanica", document.getElementById("mecanica").value);
    formData.append("electronica", document.getElementById("electronica").value);
    formData.append("prueba", document.getElementById("prueba").value);
    formData.append("resumen", document.getElementById("resumen").value);
    formData.append("recomendaciones", document.getElementById("recomendaciones").value);

    // FOTOS POR SECCIÓN
    Object.keys(fotosPorSeccion).forEach(seccion => {
        fotosPorSeccion[seccion].forEach(file => {
            formData.append(seccion, file);
        });
    });

    // PRESUPUESTO EXCEL
    const presupuestoInput = document.getElementById("presupuesto_xlsx");
    if (presupuestoInput.files.length > 0) {
        formData.append("presupuesto_xlsx", presupuestoInput.files[0]);
    }

    let link = "";

    try {

        const boton = document.querySelector("#btnEnviar");

        boton.disabled = true;
        boton.textContent = "Enviando...";

        const respuesta = await fetch("/guardar-informe", {
            method: "POST",
            body: formData
        });
        
        const data = await respuesta.json();

        if (data.ok) {
            alert("✅ Informe enviado correctamente");
        } else {
            alert("⚠️ Hubo un problema al enviar el informe");
        }

        boton.disabled = false;
        boton.textContent = "Enviar informe";

        console.log("RESPUESTA SERVIDOR:", data);

        if (data.ok && data.link) {
            link = data.link;
        } else {
            alert("No llegó el enlace del informe.");
            return;
        }

    } catch (error) {
        console.error("ERROR REAL:", error);
        alert("Hubo un error al guardar el informe.");
        return;
    }

    if(data.enviadoAutomatico){

        alert("Informe enviado correctamente");
    
    } else {
    
        let telefono = data.telefono.replace(/\D/g, "");
    
        if(telefono.length === 8){
            telefono = "598" + telefono;
        }
    
        const mensaje =
            `Hola, ya tenemos pronto tu informe vehicular:\n\n${data.link}`;
    
        const urlWhatsApp =
            `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    
        window.open(urlWhatsApp, "_blank");
    }
    
}