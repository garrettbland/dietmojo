/**
 * Adds a food entry to database
 */
export const addFoodEntry = async ({
  photoUri,
  name,
  calories,
  protein,
  carbs,
  fat,
}: {
  photoUri?: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}): Promise<{ message: "SUCCESS" | "FAILED" }> => {
  /**
   * 1. Save photo permanently (move from temp location to permanent location)
   * 2. Save food entry to db with new photo uri
   */

  return {
    message: "SUCCESS",
  };
};
