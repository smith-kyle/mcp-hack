import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import path from 'path'
import { fileURLToPath } from 'url'
// Get the directory of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const transport = new StdioClientTransport({
  command: 'node',
  args: [path.join(__dirname, 'server.js')],
})

const client = new Client({
  name: 'example-client',
  version: '1.0.0',
})

await client.connect(transport)

// List prompts
const prompts = await client.listPrompts()

console.log('Prompts:', JSON.stringify(prompts, null, 2))

// Get a prompt
const prompt = await client.getPrompt({
  name: 'echo',
  arguments: {
    message: 'Hello, world!',
  },
})

console.log('Echo Prompt:', JSON.stringify(prompt, null, 2))

// List resources
const resources = await client.listResources()

console.log('Resources:', JSON.stringify(resources, null, 2))

// Read a resource
const resource = await client.readResource({
  uri: 'echo://Helloworld!',
})

console.log('Resource:', JSON.stringify(resource, null, 2))

// Call a tool
const result = await client.callTool({
  name: 'echo',
  arguments: {
    message: 'Hello, world!',
  },
})

console.log('Echo Result:', JSON.stringify(result, null, 2))
