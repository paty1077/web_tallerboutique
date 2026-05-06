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

async function enviarInformeWhatsApp(telefono, cliente, urlInforme) {
    if (!botListo) {
        console.log("WhatsApp todavía no está listo");
        return;
    }

    const numeroLimpio = telefono.replace(/\D/g, "");

    const chatId = `${numeroLimpio}@c.us`;

    const mensaje = `Hola ${cliente || ""}, te compartimos el informe vehicular realizado por Taller Boutique.

Podés verlo en el siguiente enlace:

${urlInforme}

Gracias por confiar en nosotros.`;

    await client.sendMessage(chatId, mensaje);

    console.log("Informe enviado por WhatsApp a:", numeroLimpio);
}

module.exports = {
    enviarInformeWhatsApp
};
