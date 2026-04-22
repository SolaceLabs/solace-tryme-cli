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
      Logger.info(`Here in CB for x-ep - ${token}`);
      Logger.info(`Schema: ${JSON.stringify(schema)}`);
      Logger.info(`Value: ${JSON.stringify(value)}`);
      Logger.info(`Pointer: ${pointer}`);
      this.output.ep[token] = value;
    } else if (token === 'properties') {
      Logger.info(`Here in CB for properties - ${token}`);
      Logger.info(`Schema: ${JSON.stringify(schema)}`);
      Logger.info(`Value: ${JSON.stringify(value)}`);
      Logger.info(`Pointer: ${pointer}`);
      this.output[token] = value;
    } else if (token.startsWith('$')) {
      Logger.info(`Here in CB for $ - ${token}`);
      Logger.info(`Schema: ${JSON.stringify(schema)}`);
      Logger.info(`Value: ${JSON.stringify(value)}`);
      Logger.info(`Pointer: ${pointer}`);
      this.output[token] = value;
    }
  };
  
  parse = () => {
    const jsonSchema = new Draft07(this.schema);
    jsonSchema.each(jsonSchema, this.parseElement);
    return this.output;
  }
}
