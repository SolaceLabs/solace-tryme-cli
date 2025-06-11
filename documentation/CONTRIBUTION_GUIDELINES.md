# Solace Event Feeds - Community Contribution Guidelines

1. **Uniqueness Verification**

- Check for similar existing feeds in the community repository
If similar feeds exist, customize or specialize your feed to distinguish it and provide additional value

2. **Feed Viability**

- Ensure your feed has two or more events available for streaming (publishable)
- Verify the feed provides meaningful value to the developer community

3. **AsyncAPI Compliance**

- Use a valid AsyncAPI document that conforms to the AsyncAPI specification
- Ensure proper schema definitions for all events
- Schema Format: Use JSON as the schema format (though AsyncAPI supports various formats)

4. **Domain Relevance**

- Feeds must represent meaningful business domains or use cases
Should address real-world scenarios that developers can relate to.

5. **Data Quality Standards**

- Implement realistic mock data generation rules
- Use appropriate data generation rules for different data categories (strings, numbers, personal data, locations, internet, finance, etc.)
- Ensure generated data matches the schema specifications (including the JSON-supported formats, enums and others)

6. **Local Testing**

- Test your feed locally using stm feed run -ui before contributing
- Verify all events stream correctly
- Validate data generation produces expected results

7. **Community Value**

- Feed should provide clear value to other developers and use cases
- Consider educational, demonstration, or practical application scenarios

9. **Required Feed Information**

- Description: Clear, concise description of the feed's purpose and value proposition
- Domain: High-level business domain the feed represents (e.g., Banking, Retail, IoT, Healthcare)
- Keywords/Tags: Set of descriptive keywords that identify the feed's domain, purpose, and scope
- Feed Icon: Public URL to a suitable icon/image that visually represents the feed
- Contributor Name: For proper attribution and to enable community queries and discussions
- GitHub Handle: For attribution and technical follow-up

Have questions, feel free to reach us on [Solace Community](https://community.solace.com)