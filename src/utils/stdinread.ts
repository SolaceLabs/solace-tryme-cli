export class StdinRead {
  inputArr:string[] = [];
  closed = false;
  readline = require('readline').createInterface(process.stdin);;

  async getData() {
    return new Promise<void>((resolve, reject) => {
      this.readline.on('line', (line:string) => {
        this.inputArr.unshift(line);
      });
      this.readline.on('close', () => {
        this.closed = true;
        resolve()
      });
      this.readline.on('SIGINT', () => {
        reject();
      });
    });  
  }

  data() {
    return this.inputArr.reverse().join('\r\n')
  }
}