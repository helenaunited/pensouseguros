const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyAzuxprLUDHA5zHQk2gN6b-ra3ebxDd2sc';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function main() {
  console.log('Testando gemini-2.5-flash...');
  try {
    const r = await model.generateContent('Responda apenas com a palavra: funcionou');
    console.log('✅ Resposta:', r.response.text().trim());
  } catch (e) {
    console.log('❌ Erro:', e.message.slice(0, 200));
  }
}

main();
