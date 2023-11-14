import { Logger } from '../utils/logger'

export class SempClient {
  options:any = null;
  session:any = { hello: 1};
  sempBody:any = {};
  sempAuth:any = null;
  urlFixture = '';

  constructor(options:any) {
    // record the options
    this.options = options;

    // work on subscription support
    this.sempAuth = {
      username: this.options?.sempUsername,
      password: this.options?.sempPassword
    }
  }

  /**
   * Asynchronous function that connects to the Solace Broker using SEMP, and returns a promise.
   */
  async manageClientProfile() {
    let sempUrl = this.options.sempUrl;
    this.urlFixture = (sempUrl.toLowerCase().indexOf('/semp/v2/config') < 0) ? '/SEMP/v2/config' : '';
    switch (this.options.operation.toUpperCase()) {
      case 'LIST': sempUrl += `${this.urlFixture}/msgVpns/${this.options.sempVpn}/clientProfiles`; break;
      case 'CREATE': sempUrl += `${this.urlFixture}/${this.options.sempVpn}/clientProfiles`; break;
      case 'UPDATE': sempUrl += `${this.urlFixture}/${this.options.sempVpn}/clientProfiles/${this.options.clientProfile}`; break;
      case 'DELETE': sempUrl += `${this.urlFixture}/${this.options.sempVpn}/clientProfiles/${this.options.clientProfile}`; break;
    }

    this.sempBody = {            
      msgVpnName: this.options?.sempVpn,
      clientProfileName: this.options?.clientProfile,
      allowGuaranteedEndpointCreateDurability: this.options?.allowGuaranteedEndpointCreateDurability,
      allowGuaranteedEndpointCreateEnabled: this.options?.allowGuaranteedEndpointCreateEnabled,
      allowGuaranteedMsgReceiveEnabled: this.options?.allowGuaranteedMsgReceiveEnabled,
      allowGuaranteedMsgSendEnabled: this.options?.allowGuaranteedMsgSendEnabled,
      compressionEnabled: this.options?.compressionEnabled,
      elidingEnabled: this.options?.elidingEnabled,
      maxEgressFlowCount: this.options?.maxEgressFlowCount,
      maxIngressFlowCount: this.options?.maxIngressFlowCount,
      maxSubscriptionCount: this.options?.maxSubscriptionCount,
      rejectMsgToSenderOnNoSubscriptionMatchEnabled: this.options?.rejectMsgToSenderOnNoSubscriptionMatchEnabled,
    }
  
    if (this.options.operation.toUpperCase() === 'LIST') {
      await fetch(sempUrl, {
        method: "GET",
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: "cors",      
        headers: {
          accept: 'application/json;charset=UTF-8',
          'content-type': 'application/json',
          'Authorization': 'Basic ' + btoa(this.options?.sempUsername + ":" + this.options?.sempPassword)
        },
      })
      .then(async (response) => {
        const data = await response.json();
        if (data.meta.error) {
          Logger.logDetailedError(`get client-profiles list failed with error`, `${data.meta.error.description.split('Problem with GET: ').pop()}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`get client-profiles list successful`)
          let result = data.data;
          var clientProfiles = "";
          result.forEach((profile:any) => clientProfiles += `\n${profile.clientProfileName}`)
          Logger.logDetailedSuccess(`${result.length} client profile(s) found on vpn ${this.options.sempVpn}`, clientProfiles)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`get client-profiles list failed with error`, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        throw error;
      });
    }
    if (this.options.operation.toUpperCase() === 'CREATE') {
      await fetch(sempUrl, {
        method: "POST",
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: "cors",      
        headers: {
          accept: 'application/json;charset=UTF-8',
          'content-type': 'application/json;charset=UTF-8',
          'Authorization': 'Basic ' + btoa(this.options?.sempUsername + ":" + this.options?.sempPassword)
        },
        body: JSON.stringify(this.sempBody)
      })
      .then(async (response) => {
        const data = await response.json();
        if (data.meta.error) {
          Logger.logDetailedError(`client-profile '${this.options?.clientProfile}' creation failed with error`, `${data.meta.error.description.split('Problem with POST: ').pop()}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`client-profile '${this.options?.clientProfile}' created successfully`)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`client-profile '${this.options?.clientProfile}' creation failed with error`, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        throw error;
      });
    }
    if (this.options.operation.toUpperCase() === 'UPDATE') {
      await fetch(sempUrl, {
        method: "PATCH",
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: "cors",      
        headers: {
          accept: 'application/json;charset=UTF-8',
          'content-type': 'application/json;charset=UTF-8',
          'Authorization': 'Basic ' + btoa(this.options?.sempUsername + ":" + this.options?.sempPassword)
        },
        body: JSON.stringify(this.sempBody)
      })
      .then(async (response) => {
        const data = await response.json();
        if (data.meta.error) {
          Logger.logDetailedError(`client-profile '${this.options?.clientProfile}' update failed with error`, `${data.meta.error.description}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`client-profile '${this.options?.clientProfile}' updated successfully`)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`client-profile '${this.options?.clientProfile}' update failed with error`, `${error.toString()}`)
        if (error.cause?.message) Logger.error(`${error.cause?.message}`)
        throw error;
      });
    }
    if (this.options.operation.toUpperCase() === 'DELETE') {
      await fetch(sempUrl, {
        method: "DELETE",
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: "cors",      
        headers: {
          accept: 'application/json;charset=UTF-8',
          'content-type': 'application/json;charset=UTF-8',
          'Authorization': 'Basic ' + btoa(this.options?.sempUsername + ":" + this.options?.sempPassword)
        },
      })
      .then(async (response) => {
        const data = await response.json();
        if (data.meta.error) {
          Logger.logDetailedError(`client-profile '${this.options?.clientProfile}' delete failed with error`, `${data.meta.error.description}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`client-profile '${this.options?.clientProfile}' deleted successfully`)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`client-profile '${this.options?.clientProfile}' delete failed with error`, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        throw error;
      });
    }
  }
}