import nextHandler from "open-next-worker"
import { deleteOrphanImages } from "@/lib/image-cleanup"

export default {
  fetch: nextHandler.fetch,
  async scheduled(controller, env) {
    const deleted = await deleteOrphanImages(
      env,
      new Date(controller.scheduledTime),
    )
    console.log(`Deleted ${deleted.length} orphan images`)
  },
} satisfies ExportedHandler<CloudflareEnv>
