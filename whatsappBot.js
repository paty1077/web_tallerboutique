const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");



let botListo = false;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'WEB_TALLER'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', "--disable-dev-shm-usage"]
    },
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});

/* 👇 AGREGAR ACÁ */
process.on("SIGINT", async () => {
    console.log("Cerrando WhatsApp y Chromium...");

    try {
        await client.destroy();
    } catch (error) {
        console.log("Error cerrando client:", error);
    }

    process.exit();
});


client.on('qr', qr => {
    console.log('Escaneá este QR con EL OTRO CELULAR');
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("WhatsApp autenticado correctamente");
});

client.on('ready', () => {
    console.log('✅ WhatsApp CONECTADO');
    botListo = true;
});

client.on("auth_failure", msg => {
    console.log("ERROR DE AUTENTICACIÓN WHATSAPP:", msg);
    botListo = false;
});

client.on("disconnected", async reason => {
    console.log("ERROR: WhatsApp desconectado:", reason);
    botListo = false;

    try {
        console.log("Intentando reiniciar WhatsApp...");
        await client.initialize();
    } catch (error) {
        console.log("No se pudo reiniciar WhatsApp:", error.message);
    }
});

client.initialize().catch(error => {
    console.log("ERROR INICIANDO WHATSAPP:", error.message);
    botListo = false;
});

async function enviarInformeWhatsApp(telefono, cliente, urlInforme){

    if(!botListo){
        throw new Error("WhatsApp todavía no está listo");
    }

    let numero = telefono.replace(/\D/g, "");

    if(numero.startsWith("0")){
        numero = "598" + numero.substring(1);
    }

    if(numero.length === 8){
        numero = "598" + numero;
    }

    const chatId = numero + "@c.us";

    console.log("Intentando enviar WhatsApp a:", chatId);

    const existe = await client.isRegisteredUser(chatId);

    if(!existe){
        throw new Error("El número no está registrado en WhatsApp: " + numero);
    }

    const mensaje = `Hola ${cliente || ""}, te compartimos el informe vehicular realizado por Taller Boutique.

${urlInforme}

Gracias por confiar en nosotros.`;

    await client.sendMessage(chatId, mensaje);

    console.log("Informe enviado por WhatsApp a:", numero);
}
module.exports = {
    enviarInformeWhatsApp
};
