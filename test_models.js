const https = require('https');

const apiKey = 'AIzaSyAzuxprLUDHA5zHQk2gN6b-ra3ebxDd2sc';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const j = JSON.parse(data);
    if (j.models) {
      console.log('Modelos disponíveis:');
      j.models.forEach(m => console.log(' -', m.name, '|', m.supportedGenerationMethods?.join(', ')));
    } else {
      console.log('Resposta:', JSON.stringify(j, null, 2).slice(0, 1000));
    }
  });
}).on('error', e => console.error('Erro:', e.message));
