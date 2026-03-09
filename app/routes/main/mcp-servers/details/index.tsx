import { redirect } from 'react-router'

export async function loader({ params }: { params: { mcpServerID: string } }) {
  return redirect(`/mcp-servers/${params.mcpServerID}/overview`)
}

export default function McpServerDetailIndex() {
  return null
}
