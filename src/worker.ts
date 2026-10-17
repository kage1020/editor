import handler from "vinext/server/fetch-handler"
import { deleteOrphanImages } from "@/lib/image-cleanup"

export default {
  fetch: handler.fetch,
  async scheduled(controller, env) {
    const deleted = await deleteOrphanImages(
      env,
      new Date(controller.scheduledTime),
    )
    console.log(`Deleted ${deleted.length} orphan images`)
  },
} satisfies ExportedHandler<Env>
