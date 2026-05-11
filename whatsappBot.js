const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");



let botListo = false;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'BotTrabajo'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', "--disable-dev-shm-usage"]
    }
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

client.on('ready', () => {
    console.log('✅ WhatsApp CONECTADO');
    botListo = true;
});

client.on('disconnected', reason => {
    console.log('ERROR: Desconectado:', reason);
});

client.initialize();

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
