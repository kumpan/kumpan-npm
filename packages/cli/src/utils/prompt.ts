import readline from "node:readline/promises";

export const prompt = async (question = "") => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return rl.question(question).finally(() => rl.close());
};
