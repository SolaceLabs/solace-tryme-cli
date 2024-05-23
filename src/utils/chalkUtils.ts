import chalk from "chalk";

export const chalkWhite = (value: any) => {
  return chalk.hex('#fff').white(value);
}

export const chalkBoldWhite = (value: any) => {
  return chalk.hex('#fff').bold(value);
}

export const chalkBoldLabel = (value: any) => {
  return chalk.hex('#00c895').bold(value);
}

export const chalkBoldVariable = (value: any) => {
  return chalk.hex('#ef2929').bold(value);
}

export const chalkBoldTopicSeparator = (value: any) => {
  return chalk.hex('#32afff').bold(value);
}

export const chalkBoldError = (value: any) => {
  return chalk.redBright.bold(value);
}

export const chalkBoldWarning = (value: any) => {
  return chalk.yellowBright.bold(value);
}

export const chalkItalic = (value: any) => {
  return chalk.italic(value);
}

export const chalkEventCounterValue = (value: any) => {
  return chalk.bgMagenta.whiteBright.italic(value);
}

export const chalkEventCounterLabel = (value: any) => {
  return chalk.bgBlackBright.whiteBright.italic(value);
}

export const chalkFeedTypeHint = (value: any) => {
  return chalk.yellowBright.bold(value);
}

export const colorizeTopic = (value: string) => {
  let tokens = value.split('/');
  tokens.forEach((v, index) => {
    if (v.startsWith('{')) 
      tokens[index] = chalkBoldVariable(v.toString())
    else
      tokens[index] = chalkBoldWhite(v.toString())
  })

  return tokens.join(chalkBoldTopicSeparator('/'));
}

export const wrapContent = (emptyPrefix: string, content:string, chunkSize:number = 80) => {
  // const str = "This process was continued for several years for the deaf child does not here in a month or even in two or three years the numberless items and expressions using the simplest daily intercourse little hearing child learns from these constant rotation and imitation the conversation he hears in his home simulates is mine and suggest topics and called forth the spontaneous expression of his own thoughts.";
  const chunks = content.match(new RegExp(String.raw`\S.{1,${chunkSize - 2}}\S(?= |$)`, 'g'));
  if (!chunks || !chunks.length)
    return content;

  if (chunks.length === 1)
    return content;

  let result = chunks[0];
  for (var i=1; i<chunks.length; i++) {
    result += '\n' + emptyPrefix + chunks[i];
  }
  
  return result;
}

