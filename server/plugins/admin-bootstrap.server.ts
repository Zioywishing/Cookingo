import { useAdminDb } from "../db/client"
import { seedAdminBaseData } from "../db/seed"

export default defineNitroPlugin(() => {
  const db = useAdminDb()

  seedAdminBaseData(db)
})
