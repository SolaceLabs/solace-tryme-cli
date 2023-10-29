import { Logger } from '../utils/logger'

export class SempClient {
  options:any = null;
  session:any = { hello: 1};
  sempBody:any = {};
  sempAuth:any = null;

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
  async manageAclProfile() {
    let sempUrl = this.options.sempUrl;
    switch (this.options.operation.toUpperCase()) {
      case 'CREATE': sempUrl += `/SEMP/v2/config/msgVpns/${this.options.sempVpn}/queues`; break;
      case 'UPDATE': sempUrl += `/SEMP/v2/config/msgVpns/${this.options.sempVpn}/queues/${this.options.queueName}`; break;
      case 'DELETE': sempUrl += `/SEMP/v2/config/msgVpns/${this.options.sempVpn}/queues/${this.options.queueName}`; break;
    }

    this.sempBody = {            
      msgVpnName: this.options?.sempVpn,
      queueName: this.options?.queueName,
      accessType: this.options?.accessType?.toLowerCase(),
      deadMsgQueue: this.options?.deadMessageQueue,
      deliveryCountEnabled: this.options?.deliveryCountEnabled,
      egressEnabled: this.options?.egressEnabled,
      ingressEnabled: this.options?.ingressEnabled,
      respectTtlEnabled: this.options?.respectTtlEnabled,
      redeliveryEnabled: this.options?.redeliveryEnabled,
      maxRedeliveryCount: this.options?.maxRedeliveryCount,
      partitionCount: this.options?.partitionCount,
      partitionRebalanceDelay: this.options?.partitionRebalanceDelay,
      partitionRebalanceMaxHandoffTime: this.options?.partitionRebalanceMaxHandoffTime,
      permission: this.options?.nonOwnerPermission,
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
          Logger.logDetailedError(`error: queue creation failed with error - `, `${data.meta.error.description}`)
          Logger.error('Exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`Queue created successfully`)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`error: queue creation failed with error - `, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
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
          Logger.logDetailedError(`error: queue update failed with error - `, `${data.meta.error.description}`)
          Logger.error('Exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`Queue updated successfully`)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`error: queue update failed with error - `, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
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
          Logger.logDetailedError(`error: queue delete failed with error - `, `${data.meta.error.description}`)
          Logger.error('Exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`Queue deleted successfully`)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`error: queue delete failed with error - `, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(`error: `, `${error.cause?.message}`)
        throw error;
      });
    }


  }
}