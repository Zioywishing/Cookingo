import { successResponse } from "../../utils/api-response"
import mockRecipes from "../../utils/mock/recipe"

export default defineEventHandler(() => {
  return successResponse(mockRecipes)
})
