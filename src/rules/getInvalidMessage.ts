export const getInvalidMessage = (commentType: "Line" | "Block", commentValue: string) => {
  return `${commentType} comment "${commentValue}" does not match any of the user-defined line rules.`;
}
