import { Draft04, Draft06, Draft07, Draft2019, Draft, JsonError } from "json-schema-library";
import { Logger } from '../utils/logger'

export class JsonSchemaParser {
  schema:any = null;
  output:any = { 
    ep: {}
  };

  constructor(schema:any) {
    this.schema = schema;
  }

  validate = () => {
    const jsonSchema = new Draft2019(this.schema);
    try {
      jsonSchema.compileSchema(this.schema);
      return true;
    } catch (error:any) {
      if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`);
      return false;
    }
  }

  parseElement = (schema:any, value:any, pointer:any) => {
    if (!pointer.startsWith('#/__rootSchema/')) return;
    var tokens = pointer.split('/');
    if ((tokens.filter((t:string) => t === 'properties')).length > 1) return;
    var token = tokens.pop();
    if (token.startsWith('x-ep-')) {
      console.log('Here in CB for x-ep - ', token);
      console.log('Schema', schema);
      console.log('Value', value);
      console.log('Pointer', pointer);  
      console.log('------------------------')
      this.output.ep[token] = value;
    } else if (token === 'properties') {
      console.log('Here in CB for properties - ', token);
      console.log('Schema', schema);
      console.log('Value', value);
      console.log('Pointer', pointer);  
      console.log('------------------------')
      this.output[token] = value;
    } else if (token.startsWith('$')) {
      console.log('Here in CB for $ - ', token);
      console.log('Schema', schema);
      console.log('Value', value);
      console.log('Pointer', pointer);  
      console.log('------------------------')
      this.output[token] = value;
    }
  };
  
  parse = () => {
    const jsonSchema = new Draft07(this.schema);
    jsonSchema.each(jsonSchema, this.parseElement);
    return this.output;
  }
}
