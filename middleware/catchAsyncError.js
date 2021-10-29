export const catchAsyncError = (errors) => (req, res, next) => {
    Promise.resolve(errors(req, res, next)).catch(next)
}