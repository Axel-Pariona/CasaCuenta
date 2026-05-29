export const logError = (error) => {
  if (import.meta.env.DEV) {
    console.error(error)
  }
}