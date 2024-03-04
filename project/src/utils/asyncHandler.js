const asyncHandler = (requestHandler) => {
    
    return (req,res,next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err))
    }
}

export {asyncHandler}
/*

In Express.js, `next(err)` is a convention used to pass an error to the next middleware function or error-handling middleware in the chain. When an error occurs within a middleware function, calling `next(err)` triggers the error-handling middleware, skipping the rest of the middleware stack and routing the error to the appropriate error-handling middleware.

Here's how it works:

1. When you call `next(err)` within a middleware function, Express.js will start looking for an error-handling middleware to handle the error.

2. Express.js considers middleware functions that accept four parameters (err, req, res, next) as error-handling middleware. These middleware functions are defined with `(err, req, res, next)` as their parameter list.

3. When an error occurs and `next(err)` is called, Express.js starts looking for an error-handling middleware in the middleware stack. It skips regular middleware functions (those with three parameters) until it finds one that matches the error-handling function signature.

4. Once Express.js finds an appropriate error-handling middleware, it calls that middleware, passing the `err` along with the request, response, and next function.

5. The error-handling middleware can then handle the error in any way necessary, such as logging it, sending an error response to the client, or performing any cleanup tasks.

If there's no error-handling middleware defined in the application, Express.js will handle the error by sending an appropriate HTTP response to the client with the error details.

So, `next(err)` essentially passes the error to the next middleware or error-handling middleware in the Express.js middleware stack, allowing for centralized error handling in an Express.js application.
*/

// const foo = () => {async() => {}}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }