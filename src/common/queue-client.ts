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
  async manageQueue() {
    let sempUrl = this.options.sempUrl;
    this.urlFixture = (sempUrl.toLowerCase().indexOf('/semp/v2/config') < 0) ? '/SEMP/v2/config' : '';
    switch (this.options.operation.toUpperCase()) {
      case 'LIST': sempUrl += `${this.urlFixture}/msgVpns/${this.options.sempVpn}/queues`; break;
      case 'CREATE': sempUrl += `${this.urlFixture}/msgVpns/${this.options.sempVpn}/queues`; break;
      case 'UPDATE': sempUrl += `${this.urlFixture}/msgVpns/${this.options.sempVpn}/queues/${this.options.queue}`; break;
      case 'DELETE': sempUrl += `${this.urlFixture}/msgVpns/${this.options.sempVpn}/queues/${this.options.queue}`; break;
    }

    this.sempBody = {            
      msgVpnName: this.options?.sempVpn,
      queueName: this.options?.queue,
      owner: this.options?.owner,
      accessType: this.options?.accessType?.toLowerCase(),
      deadMsgQueue: this.options?.deadMessageQueue,
      deliveryCountEnabled: this.options?.deliveryCountEnabled,
      deliveryDelay: this.options?.deliveryDelay,
      egressEnabled: this.options?.egressEnabled,
      ingressEnabled: this.options?.ingressEnabled,
      maxMsgSize: this.options?.maxMsgSize,
      maxMsgSpoolUsage: this.options?.maxMsgSpoolUsage,
      respectTtlEnabled: this.options?.respectTtlEnabled,
      redeliveryEnabled: this.options?.redeliveryEnabled,
      maxRedeliveryCount: this.options?.maxRedeliveryCount,
      partitionCount: this.options?.partitionCount,
      partitionRebalanceDelay: this.options?.partitionRebalanceDelay,
      partitionRebalanceMaxHandoffTime: this.options?.partitionRebalanceMaxHandoffTime,
      permission: this.options?.permission,
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
          Logger.logDetailedError(`get queues list failed with error`, `${data.meta.error.description.split('Problem with GET: ').pop()}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`get queues list successful`)
          let result = data.data;
          var queues = "";
          result.forEach((q:any) => queues += `\n${q.queueName}`)
          Logger.logDetailedSuccess(`${result.length} queue(s) found on vpn ${this.options.sempVpn}`, queues)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`get queues list failed with error`, `${error.toString()}`)
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
          Logger.logDetailedError(`queue '${this.options?.queue}' creation failed with error`, `${data.meta.error.description.split('Problem with POST: ').pop()}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`queue '${this.options?.queue}' created successfully`)
          await this.manageSubscription();
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`queue '${this.options?.queue}' creation failed with error`, `${error.toString()}`)
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
          Logger.logDetailedError(`queue '${this.options?.queue}' update failed with error`, `${data.meta.error.description}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`queue updated successfully`)
          await this.manageSubscription();
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`queue '${this.options?.queue}' update failed with error`, `${error.toString()}`)
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
          Logger.logDetailedError(`queue '${this.options?.queue}' delete failed with error`, `${data.meta.error.description}`)
          Logger.error('exiting...')
          process.exit(1)
        } else {
          Logger.logSuccess(`queue '${this.options?.queue}' deleted successfully`)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`queue '${this.options?.queue}' delete failed with error`, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        throw error;
      });
    }


  }

  /**
   * Asynchronous function that connects to the Solace Broker using SEMP, and returns a promise.
   */
  async manageSubscription() {
    if (this.options.addSub) {
      var sempUrl = this.options.sempUrl + `${this.urlFixture}/msgVpns/${this.options.sempVpn}/queues/${this.options.queue}/subscriptions`;
      for (var i=0; i<this.options.addSubscriptions.length; i++) {
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
          body: JSON.stringify({
            msgVpnName: this.options.sempVpn,
            queueName: this.options.queue,
            subscriptionTopic: this.options.addSubscriptions[i]
          })
        })
        .then(async (response) => {
          const data = await response.json();
          if (data.meta.error) {
            Logger.logDetailedWarn(`add subscription to queue '${this.options?.queue}' encountered error`, `${data.meta.error.description.split('Problem with POST: ').pop()}`)
          } else {
            Logger.logSuccess(`subscription to topic '${this.options.addSubscriptions[i]}' added successfully `)
          }
        })
        .catch((error) => {
          Logger.logDetailedError(`add subscription to queue '${this.options?.queue}' failed with error`, `${error.toString()}`)
          if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        });
      }
    }

    if (this.options.removeSub) {
      for (var i=0; i<this.options.removeSubscriptions.length; i++) {
        var sempUrl = this.options.sempUrl + `${this.urlFixture}/msgVpns/${this.options.sempVpn}/queues/${this.options.queue}/subscriptions/${encodeURIComponent(this.options.removeSubscriptions[i])}`;
        await fetch(sempUrl, {
          method: "DELETE",
          credentials: 'same-origin',
          cache: 'no-cache',
          mode: "cors",      
          headers: {
            accept: 'application/json;charset=UTF-8',
            'content-type': 'application/json;charset=UTF-8',
            'Authorization': 'Basic ' + btoa(this.options?.sempUsername + ":" + this.options?.sempPassword)
          }
        })
        .then(async (response) => {
          const data = await response.json();
          if (data.meta.error) {
            Logger.logDetailedWarn(`remove subscription from queue '${this.options?.queue}' encountered error`, `${decodeURIComponent(data.meta.error.description)}`)
          } else {
            Logger.logSuccess(`subscription to topic '${this.options.removeSubscriptions[i]}' removed successfully `)
          }
        })
        .catch((error) => {
          Logger.logDetailedError(`remove subscription from queue '${this.options?.queue}' failed with error`, `${error.toString()}`)
          if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
        });
      }
    }

    if (this.options.listSub) {
      var sempUrl = this.options.sempUrl + `${this.urlFixture}/msgVpns/${this.options.sempVpn}/queues/${this.options.queue}/subscriptions`;
      await fetch(sempUrl, {
        method: "GET",
        credentials: 'same-origin',
        cache: 'no-cache',
        mode: "cors",      
        headers: {
          accept: 'application/json;charset=UTF-8',
          'content-type': 'application/json;charset=UTF-8',
          'Authorization': 'Basic ' + btoa(this.options?.sempUsername + ":" + this.options?.sempPassword)
        }
      })
      .then(async (response) => {
        const data = await response.json();
        if (data.meta.error) {
          Logger.logDetailedWarn(`list subscription on queue '${this.options?.queue}' encountered error`, `${decodeURIComponent(data.meta.error.description)}`)
        } else {
          let result = data.data;
          var subs = "";
          result.forEach((sub:any) => subs += `\n${sub.subscriptionTopic}`)
          Logger.logDetailedSuccess(`${result.length} subscription(s) found on queue ${this.options.queue}`, subs)
        }
      })
      .catch((error) => {
        Logger.logDetailedError(`remove subscription on queue '${this.options?.queue}' failed with error`, `${error.toString()}`)
        if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
      })
    }
  }
}