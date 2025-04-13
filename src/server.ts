import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import fs from 'fs/promises'
import { exec } from 'child_process'

const server = new McpServer({
  name: 'Echo',
  version: '1.0.0',
})

server.tool(
  'grep',
  'Run grep on a directory and return the matching results',
  { directory: z.string(), query: z.string() },
  async ({ directory, query }) => {
    // Grep the entire directory for the query using the grep command
    // and return the result as a list of files and lines
    return new Promise((resolve, reject) => {
      exec(`grep -r "${query}" "${directory}"`, (error, stdout, stderr) => {
        if (error && error.code !== 1) {
          // grep returns code 1 when no matches found, which isn't an error for us
          resolve({
            content: [{ type: 'text', text: `Error: ${stderr || error.message}` }],
          })
          return
        }

        const results = stdout.trim()
        const matches = results
          ? results.split('\n').map((line) => {
              const [filePath, ...contentParts] = line.split(':')
              const content = contentParts.join(':')
              return { filePath, content }
            })
          : []

        resolve({
          content: [
            {
              type: 'text',
              text:
                matches.length > 0
                  ? `Found ${matches.length} matches for "${query}":\n${matches
                      .map((m) => `- ${m.filePath}`)
                      .join('\n')}`
                  : `No matches found for "${query}" in ${directory}`,
            },
          ],
        })
      })
    })
  },
)

server.prompt('echo', { message: z.string() }, ({ message }) => ({
  messages: [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `Please process this message: ${message}`,
      },
    },
  ],
}))

const transport = new StdioServerTransport()
await server.connect(transport)
