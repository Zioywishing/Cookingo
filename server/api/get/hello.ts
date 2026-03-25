import { successResponse } from "../../utils/api-response"

export default defineEventHandler(() => {
  return successResponse("hello-world")
})
