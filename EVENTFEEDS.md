# `stm` Event Feeds

`stm` event feeds are configurations that represents an event streaming service built on an AsyncAPI document of an Event Portal Application or a public REST API endpoint.

a) From an **AsyncAPI document** - An event feed generated from an AsyncAPI file downloaded from Event Portal captures the underlying schema, event and publish/subscribe settings as represented by the Application. With focus on the *publish* settings, the `stm feed` configuration captures necessary details to generate mock events, with rules to generate data matching the schema and stream them to a Solace PubSub+ broker.

b) From a publicly accessible **REST API endpoint** - An event feed generated for a publicly REST API captures information representing API URL, path & query parameters along with connection details (key/token or others).

To invoke feed commands of the `stm` tool, you issue a sub-command `feed` followed by desired operation.
```
stm
├── -v, --version                   /* output the version number                      */
├── -h, --help                      /* display help for command                       */
├── -he, --help-examples            /* display examples                               */
└── feed                            /* manage event feeds                             */
    ├── -h, --help                  /* display help for command                       */
    ├── -he, --help-examples        /* display examples                               */
    ├── preview                     /* Validate and preview an AsyncAPI document      */
    ├── generate                    /* Generate event feed from an AsyncAPI document  */
    ├── configure                   /* Configure event feed rules                     */
    ├── run                         /* Run event feed                                 */
    ├── list                        /* List event feeds                               */
    ├── copy                        /* Duplicate a community event feed locally       */
    └── contribute                  /* Contribute to community event feeds            */
```

## Local vs Community (also referred to as Contributed) feeds

As you are building and testing an event feed using *stm*, you would create event feeds locally. You can configure feed rules, test and execute them by pointing to local or cloud brokers easily. These are referred to as *local event feeds*.

If the created feed has value in terms of domain-specialization or reuse by community members, you can contribute the feeds to be added to the community repository. These contributed feeds can be accessed by other members directly from the community site or cloned to create a copy for local use.

## Feed Types

`stm feed` supports two distinct types of event feeds viz., AsyncAPI feeds and REST API feeds. 

### AsyncAPI Feed

An event feed generated from an AsyncAPI document corresponding to an *Application* from *Event Portal* is referred to as AsyncAPI feed. This feed type allows you to operate on events that the application is permitted to publish and generate events. You can configure rules for event feed (including data generation, topic construction and publish settings). At runtime, you can simply point to a broker (local or cloud) and stream a series of events.

### REST API Feed

An event feed generated from a REST API endpoint, a publicly available APIs is referred to as REST API feed. The feed allows you to configure API path & query parameters, authentication parameters and publish settings. At runtime, the API is invoked and the result is streamed as event to the pointed broker.

Now, let us examine the feed operations.

# `stm feed` tool Interactivity

All feed commands can be executed interactively, in a guided manner with the tool walking you through the steps, presenting appropriate queries and options. However, the commands also support a parameterized specification of values for options to execute the command. 

Here is an example of `preview` command that takes the options interactively on the command-line.

/docrefs/interactive-1.mov



The same command can be executed with parameterized options that will produce the same result.

```
stm feed preview -file "work/Kitchen Floor-0.1.0.json"
```


# `stm feed` Commands

## Preview

The `preview' sub-command allows you to preview an AsyncAPI document representing an Application designed on the Event Portal to gain a quick visual preview of the Application details around publish/receive events and details of schema referred by these events.

You can also preview an existing local or community feed.