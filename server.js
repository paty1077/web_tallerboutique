const express = require("express");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { enviarInformeWhatsApp } = require("./whatsappBot");

const app = express();

const session = require("express-session");
const bcrypt = require("bcrypt");

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(session({
    secret: "tallerboutique2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

const usuarioAdmin = {
    usuario: "taller",
    passwordHash: bcrypt.hashSync("boutique", 10)
};

//Lista Informes 
app.get("/admin/informes", verificarLogin, async (req, res) => {
    try {
        const [informes] = await pool.query(`
            SELECT id, token, cliente, telefono, marca, modelo, matricula, estado, fecha_creado
            FROM informes_vehiculares
            ORDER BY id DESC
        `);

        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Informes guardados</title>
                <style>
                    body{
                        font-family: Arial, sans-serif;
                        background:#F8FAFC;
                        padding:2rem;
                    }
                    .contenedor{
                        max-width:1100px;
                        margin:auto;
                        background:white;
                        padding:2rem;
                        border-radius:1.5rem;
                    }
                    table{
                        width:100%;
                        border-collapse:collapse;
                    }
                    th, td{
                        padding:1rem;
                        border-bottom:1px solid #ddd;
                        text-align:left;
                    }
                    a{
                        display:inline-block;
                        padding:.7rem 1rem;
                        background:#475569;
                        color:white;
                        text-decoration:none;
                        border-radius:.8rem;
                        margin:.2rem;
                    }
                </style>
            </head>
            <body>
                <div class="contenedor">
                    <h1>Informes guardados</h1>

                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Vehículo</th>
                                <th>Matrícula</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${informes.map(informe => `
                                <tr>
                                    <td>${informe.cliente || ""}</td>
                                    <td>${informe.marca || ""} ${informe.modelo || ""}</td>
                                    <td>${informe.matricula || ""}</td>
                                    <td>${informe.estado || ""}</td>
                                    <td>
                                        <a href="/informe/${informe.token}" target="_blank">Ver</a>
                                        <a href="/editar-informe/${informe.id}">Editar</a>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al listar informes");
    }
});

function verificarLogin(req, res, next){

    if(req.session.logueado){
        return next();
    }

    res.redirect("/login");
}

app.get("/login", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Login - Taller Boutique</title>

            <style>

                :root{
                    --oscuro:#1F2937;
                    --grisMedio:#475569;
                    --borde:#E5E7EB;
                    --fondo:#F8FAFC;
                    --fondoSuave:#F3F6F9;
                    --blanco:#FFFFFF;
                    --heroInicio:#475569;
                    --heroFin:#64748B;
                }
                html{
                        font-size:62.5%;
                        box-sizing:border-box;
                    }

                    *, *::before, *::after{
                        box-sizing:inherit;
                    }


                *{
                    margin:0;
                    padding:0;
                    box-sizing:border-box;
                }

                body{
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:2rem;
                    font-family:"Montserrat", sans-serif;

                    background:
                        linear-gradient(
                            180deg,
                            var(--fondoSuave) 0%,
                            var(--fondo) 45%
                        );
                }

                .login-card{
                    width:100%;
                    max-width:42rem;

                    background:var(--blanco);

                    padding:4rem 3rem;

                    border-radius:2rem;

                    box-shadow:
                        0 2rem 5rem rgba(15,23,42,.12);
                }

                .logo{
                    text-align:center;
                    margin-bottom:1rem;
                }

                .logo img{
                    width:75%;
                    max-width:30rem;
                }

                h1{
                    text-align:center;
                    color:var(--oscuro);
                    font-size:2.8rem;
                    margin-bottom:3rem;
                    text-transform:uppercase;
                }

                .campo{
                    margin-bottom:1.8rem;
                }

                input{
                    width:100%;
                    padding:1.5rem;

                    border:1px solid var(--borde);

                    border-radius:1.4rem;

                    font-size:1.5rem;

                    font-family:"Montserrat", sans-serif;
                }

                input:focus{
                    outline:none;

                    border-color:var(--grisMedio);

                    box-shadow:
                        0 0 0 .4rem rgba(71,85,105,.10);
                }

                button{
                    width:100%;
                    border:none;

                    padding:1.6rem;

                    border-radius:1.5rem;

                    background:
                        linear-gradient(
                            135deg,
                            var(--heroInicio),
                            var(--heroFin)
                        );

                    color:white;

                    font-size:1.6rem;
                    font-weight:700;

                    cursor:pointer;
                }

            </style>
        </head>

        <body>

            <div class="login-card">

                <div class="logo">
                    <img src="/img/Chiquitocomun.png">
                </div>

                <h1>Ingresar</h1>

                <form method="POST">

                    <div class="campo">
                        <input
                            type="text"
                            name="usuario"
                            placeholder="Usuario"
                            required
                        >
                    </div>

                    <div class="campo">
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            required
                        >
                    </div>

                    <button type="submit">
                        Ingresar
                    </button>

                </form>

            </div>

        </body>
        </html>
    `);
    

});

app.post("/login", async (req, res) => {

    const { usuario, password } = req.body;

    if(
        usuario === usuarioAdmin.usuario &&
        bcrypt.compareSync(password, usuarioAdmin.passwordHash)
    ){
        req.session.logueado = true;

        return res.redirect("/");
    }

    res.send("Usuario o contraseña incorrectos");

});

const fs = require("fs");
const { execFile } = require("child_process");

const carpetaUploads = "public/uploads/informes";

if (!fs.existsSync(carpetaUploads)) {
    fs.mkdirSync(carpetaUploads, { recursive: true });
}

// Conexión MySQL
const pool = mysql.createPool({
    host: "localhost",
    user: "huawei",
    password: "huawei",
    database: "HUAWEI",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, carpetaUploads);
    },
    filename: function (req, file, cb) {
        const nombreUnico = Date.now() + "-" + file.originalname;
        cb(null, nombreUnico);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

function convertirExcelAPdf(archivoExcel, carpetaSalida) {
    return new Promise((resolve, reject) => {
        execFile("libreoffice", [
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            carpetaSalida,
            archivoExcel
        ], (error) => {
            if (error) {
                reject(error);
            } else {
                const nombrePdf = path.basename(archivoExcel, path.extname(archivoExcel)) + ".pdf";
                resolve(path.join(carpetaSalida, nombrePdf));
            }
        });
    });
}

// Guardar informe
app.post("/guardar-informe", upload.any(), async (req, res) => {
    try {
        const token = crypto.randomBytes(32).toString("hex");

        const {
            informe_id,
            cliente,
            telefono,
            marca,
            modelo,
            anio,
            kms,
            matricula,
            estado,
            chasis,
            carroceria,
            interior,
            mecanica,
            electronica,
            prueba,
            resumen,
            recomendaciones
        } = req.body;

        console.log(req.files);

        
        const archivos = req.files || [];

        const fotos = archivos.filter(file => file.fieldname !== "presupuesto_xlsx");

        const presupuesto = archivos.find(file => file.fieldname === "presupuesto_xlsx");
    
        let informeId;

        if(informe_id){

            await pool.query(`
                UPDATE informes_vehiculares
                SET
                    token = ?,
                    cliente = ?,
                    telefono = ?,
                    marca = ?,
                    modelo = ?,
                    anio = ?,
                    kms = ?,
                    matricula = ?,
                    estado = ?,
                    chasis = ?,
                    carroceria = ?,
                    interior_auto = ?,
                    mecanica = ?,
                    electronica = ?,
                    prueba_dinamica = ?,
                    resumen = ?,
                    recomendaciones = ?
                WHERE id = ?
            `, [
                token,
                cliente,
                telefono,
                marca,
                modelo,
                anio,
                kms,
                matricula,
                estado,
                chasis,
                carroceria,
                interior,
                mecanica,
                electronica,
                prueba,
                resumen,
                recomendaciones,
                informe_id
            ]);
        
            informeId = informe_id;
        
        } else {
        
            const [resultado] = await pool.query(`
                INSERT INTO informes_vehiculares
                (
                    token,
                    cliente,
                    telefono,
                    marca,
                    modelo,
                    anio,
                    kms,
                    matricula,
                    estado,
                    chasis,
                    carroceria,
                    interior_auto,
                    mecanica,
                    electronica,
                    prueba_dinamica,
                    resumen,
                    recomendaciones
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        
                ON DUPLICATE KEY UPDATE
                    token = VALUES(token),
                    cliente = VALUES(cliente),
                    marca = VALUES(marca),
                    modelo = VALUES(modelo),
                    anio = VALUES(anio),
                    kms = VALUES(kms),
                    matricula = VALUES(matricula),
                    estado = VALUES(estado),
                    chasis = VALUES(chasis),
                    carroceria = VALUES(carroceria),
                    interior_auto = VALUES(interior_auto),
                    mecanica = VALUES(mecanica),
                    electronica = VALUES(electronica),
                    prueba_dinamica = VALUES(prueba_dinamica),
                    resumen = VALUES(resumen),
                    recomendaciones = VALUES(recomendaciones)
            `, [
                token,
                cliente,
                telefono,
                marca,
                modelo,
                anio,
                kms,
                matricula,
                estado,
                chasis,
                carroceria,
                interior,
                mecanica,
                electronica,
                prueba,
                resumen,
                recomendaciones
            ]);
        
           
            informeId = resultado.insertId;
        }
        
        for (const file of fotos) {
            await pool.query(`
                INSERT INTO fotos_informes_vehiculares (informe_id, seccion, ruta_foto)
                VALUES (?, ?, ?)
            `, [
                informeId,
                file.fieldname,
                "/uploads/informes/" + file.filename
            ]);
        }

        if (presupuesto) {
            try {
                console.log("CONVIRTIENDO EXCEL A PDF...");
        
                const pdfGenerado = await convertirExcelAPdf(
                    presupuesto.path,
                    "public/uploads/informes"
                );
        
                console.log("PDF GENERADO:", pdfGenerado);
        
                const rutaPresupuestoPdf = "/uploads/informes/" + path.basename(pdfGenerado);
        
                await pool.query(`
                    UPDATE informes_vehiculares
                    SET presupuesto_pdf = ?
                    WHERE id = ?
                `, [
                    rutaPresupuestoPdf,
                    informeId
                ]);
        
            } catch (error) {
                console.error("ERROR CONVIRTIENDO EXCEL A PDF:", error.message);
            }
        }
        

        const link = `http://localhost:3000/informe/${token}`;

        console.log("TOKEN GUARDADO:", token);
        console.log("ID GUARDADO:", informeId);

        const urlInforme = `https://tallerboutique.com.uy/informe/${token}`;
     
        if (req.body.enviarWhatsapp === "true") {
     
            try {
                await enviarInformeWhatsApp(
                    telefono,
                    cliente,
                    urlInforme
                );
            
                return res.json({
                    ok: true,
                    mensaje: "Informe guardado y enviado por WhatsApp",
                    enviadoAutomatico: true,
                    link: urlInforme
                });
            
            } catch (errorWhatsapp) {
                console.error("ERROR ENVIANDO WHATSAPP:", errorWhatsapp);
            
                return res.json({
                    ok: true,
                    mensaje: "Informe guardado, pero no se pudo enviar automático",
                    enviadoAutomatico: false,
                    telefono: telefono,
                    link: urlInforme
                });
            }
        }

        return res.json({
            ok: true,
            mensaje: "Informe guardado correctamente",
            enviadoAutomatico: false,
            link: urlInforme
        });
                
    } catch (error) {
        console.error("ERROR AL GUARDAR INFORME:", error);

        res.status(500).json({
            ok: false,
            mensaje: "Error al guardar el informe",
            error: error.message
    });
    }
});

// Ver informe por token
app.get("/informe/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const [rows] = await pool.query(
            "SELECT * FROM informes_vehiculares WHERE token = ?",
            [token]
        );

        if (rows.length === 0) {
            return res.send("Informe no encontrado");
        }

        const info = rows[0];

        // traer fotos
        const [fotos] = await pool.query(
            "SELECT * FROM fotos_informes_vehiculares WHERE informe_id = ?",
            [info.id]
        );

        const fotosPorSeccion = {
            fotos_chasis: [],
            fotos_carroceria: [],
            fotos_interior: [],
            fotos_mecanica: [],
            fotos_electronica: [],
            fotos_prueba: [],
            fotos_resumen: []
        };
        
        fotos.forEach(f => {
            if (fotosPorSeccion[f.seccion]) {
                fotosPorSeccion[f.seccion].push(f.ruta_foto);
            }
        });

        function renderFotos(lista) {
            if (!lista || lista.length === 0) return "";
        
            return `
                <div class="galeria">
                    ${lista.map(f => `<img src="${f}">`).join("")}
                </div>
            `;
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Informe Vehicular</title>
                <style>
                    :root{
                        --oscuro:#1F2937;
                        --grisOscuro:#334155;
                        --grisMedio:#475569;
                        --gris:#6B7280;
                        --borde:#E5E7EB;
                        --fondo:#F8FAFC;
                        --fondoSuave:#F3F6F9;
                        --blanco:#FFFFFF;
                        --heroInicio:#475569;
                        --heroFin:#64748B;
                    }

                    html{
                        font-size:62.5%;
                        box-sizing:border-box;
                    }

                    *, *::before, *::after{
                        box-sizing:inherit;
                    }

                    body{
                        font-family:"Montserrat", Arial, sans-serif;
                        background:linear-gradient(180deg,var(--fondoSuave) 0%, var(--fondo) 45%);
                        margin:0;
                        padding:3rem 1.5rem;
                        color:var(--oscuro);
                        line-height:1.6;
                    }

                    .card{
                        max-width:850px;
                        margin:auto;
                        background:var(--blanco);
                        padding:4rem;
                        border-radius:2rem;
                        box-shadow:0 2rem 5rem rgba(15,23,42,.12);
                    }

                    .logo{
                        text-align:center;
                        margin-bottom: -1.2rem;
                    }

                    .logo img{
                        max-width:360px;
                        width:78%;
                        height:auto;
                        display:inline-block;
                    }

                    h1{
                        text-align:center;
                        color:var(--oscuro);
                        font-size: 3.2rem;
                        margin:0 0 2rem;
                        letter-spacing:.12rem;
                        text-transform:uppercase;
                        line-height:1;   
                    }

                    h2{
                        color:var(--grisMedio);
                        border-bottom:1px solid var(--borde);
                        padding-bottom:.8rem;
                        margin-top: 2.2rem;
                        font-size: 1.7rem;
                    }

                    p{
                        font-size:1.45rem;
                        color:var(--oscuro);
                        margin:.8rem 0;
                    }

                    strong{
                        color:var(--grisOscuro);
                    }

                    .galeria {
                        display:flex;
                        flex-wrap:wrap;
                        gap:1rem;
                        margin:1rem 0 2rem;
                    }

                    .galeria img {
                        width:10rem;
                        height:10rem;
                        object-fit:cover;
                        border-radius:1.2rem;
                        cursor:pointer;
                        border:1px solid var(--borde);
                        transition:transform .2s ease;
                    }

                    .galeria img:hover {
                        transform:scale(1.04);
                    }

                    .btn-presupuesto {
                        display:inline-block;
                        background:linear-gradient(135deg,var(--heroInicio),var(--heroFin));
                        color:var(--blanco);
                        padding:1.3rem 2rem;
                        border-radius:1.2rem;
                        text-decoration:none;
                        font-weight:700;
                        box-shadow:0 1rem 2.5rem rgba(15,23,42,.16);
                    }

                    @media (max-width:600px){
                        body{
                            padding:1.5rem;
                        }

                        .card{
                            padding:2.4rem 1.8rem;
                            border-radius:1.6rem;
                        }

                        .logo img{
                            max-width:220px;
                            width:85%;
                        }

                        h1{
                            font-size:2.6rem;
                        }

                        h2{
                            font-size:1.55rem;
                        }
                        p{
                            font-size:1.4rem;
                        }
                        .galeria img{
                            width:9rem;
                            height:9rem;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="logo">
                        <img src="/img/Chiquitocomun.png" alt="Taller Boutique">
                    </div>
                
                    <h1>Informe Vehicular</h1>

                    <h2>Datos del Cliente</h2>
                    <p><strong>Cliente:</strong> ${info.cliente || ""}</p>

                    <h2>Datos del Vehículo</h2>
                    <p><strong>Marca:</strong> ${info.marca || ""}</p>
                    <p><strong>Modelo:</strong> ${info.modelo || ""}</p>
                    <p><strong>Año:</strong> ${info.anio || ""}</p>
                    <p><strong>Kilómetros:</strong> ${info.kms || ""}</p>
                    <p><strong>Matrícula:</strong> ${info.matricula || ""}</p>
                    <p><strong>Estado:</strong> ${info.estado || ""}</p>

                    <h2>Resultados</h2>
                    <p><strong>Chasis:</strong> ${info.chasis || ""}</p>
                    ${renderFotos(fotosPorSeccion.fotos_chasis)}
                    <p><strong>Carrocería:</strong> ${info.carroceria || ""}</p>
                    ${renderFotos(fotosPorSeccion.fotos_carroceria)}
                    <p><strong>Interior:</strong> ${info.interior_auto || ""}</p>
                    ${renderFotos(fotosPorSeccion.fotos_interior)}
                    <p><strong>Mecánica:</strong> ${info.mecanica || ""}</p>
                    ${renderFotos(fotosPorSeccion.fotos_mecanica)}
                    <p><strong>Electrónica:</strong> ${info.electronica || ""}</p>
                    ${renderFotos(fotosPorSeccion.fotos_electronica)}
                    <p><strong>Prueba dinámica:</strong> ${info.prueba_dinamica || ""}</p>
                    ${renderFotos(fotosPorSeccion.fotos_prueba)}

                    <h2>Resumen</h2>
                    <p>${info.resumen || ""}</p>
                    ${renderFotos(fotosPorSeccion.fotos_resumen)}

                    <h2>Recomendaciones</h2>
                    <p>${info.recomendaciones || ""}</p>
                
                    ${info.presupuesto_pdf ? `
                        <h2>Presupuesto</h2>
                        <p>
                            <a href="${info.presupuesto_pdf}" target="_blank" class="btn-presupuesto">
                                Ver presupuesto en PDF
                            </a>
                        </p>
                    ` : ""}
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al mostrar el informe");
    }
});

app.delete("/api/foto/:id", verificarLogin, async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            "SELECT ruta_foto FROM fotos_informes_vehiculares WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.json({ ok: false, mensaje: "Foto no encontrada" });
        }

        const rutaFoto = rows[0].ruta_foto;
        const rutaArchivo = path.join(__dirname, "public", rutaFoto);

        if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo);
        }

        await pool.query(
            "DELETE FROM fotos_informes_vehiculares WHERE id = ?",
            [id]
        );

        res.json({ ok: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al borrar foto"
        });
    }
});

app.get("/api/informe/:id", verificarLogin, async (req, res) => {

    try {

        const { id } = req.params;

        const [rows] = await pool.query(
            "SELECT * FROM informes_vehiculares WHERE id = ?",
            [id]
        );

        if(rows.length === 0){

            return res.status(404).json({
                ok:false,
                mensaje:"Informe no encontrado"
            });
        }

        const [fotos] = await pool.query(
            "SELECT * FROM fotos_informes_vehiculares WHERE informe_id = ?",
            [id]
        );
        

        res.json({
            ok:true,
            informe: rows[0],
            fotos: fotos
        });

    } catch(error){

        console.error(error);

        res.status(500).json({
            ok:false,
            mensaje:"Error al cargar informe"
        });
    }
});


app.get("/editar-informe/:id", verificarLogin, (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "informe.html")
    );

});



app.get("/", verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/informe-nuevo", verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "informe.html"));
});


app.use("/css", verificarLogin, express.static(path.join(__dirname, "public/css")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use("/js", verificarLogin, express.static(path.join(__dirname, "public/js")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(express.static(path.join(__dirname, "public")));
app.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});


app.get("/logout", (req, res) => {

    req.session.destroy(() => {
        res.redirect("/login");
    });

});

app.use((err, req, res, next) => {

    console.error("ERROR GLOBAL:", err);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            ok: false,
            mensaje: err.message
        });
    }

    res.status(500).json({
        ok: false,
        mensaje: err.message
    });
});
