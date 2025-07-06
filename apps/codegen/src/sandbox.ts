import readline from 'readline';
import { generateCode } from './openai';

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Prompt: ', async (prompt) => {
    const code = await generateCode({ description: prompt });
    console.log(code);
    rl.close();
  });
}

if (require.main === module) {
  main();
}
