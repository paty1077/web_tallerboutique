const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "taller-boutique"
    }),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

let botListo = false;

client.on("qr", qr => {
    console.log("Escaneá este QR con WhatsApp:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    botListo = true;
    console.log("WhatsApp conectado correctamente");
});

client.on("disconnected", reason => {
    botListo = false;
    console.log("WhatsApp desconectado:", reason);
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
